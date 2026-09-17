<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\ApplicationStatus;
use App\Enums\JobStatus;
use App\Enums\JobType;
use App\Enums\UserRole;
use App\Models\Application;
use App\Models\Category;
use App\Models\Employer;
use App\Models\JobPost;
use App\Models\User;
use App\Notifications\V1\Employee\ApplicationStatusChangedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployeeNotificationTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $employerUser;

    private Employer $employer;

    private User $employeeUser;

    private JobPost $jobPost;

    private Application $application;

    protected function setUp(): void
    {
        parent::setUp();

        $this->admin = User::factory()->create([
            'role' => UserRole::ADMIN,
            'email_verified_at' => now(),
        ]);

        $this->employerUser = User::factory()->create([
            'role' => UserRole::EMPLOYER,
            'email_verified_at' => now(),
        ]);

        $this->employer = Employer::create([
            'user_id' => $this->employerUser->id,
            'company_name' => 'Acme Corporation',
            'email' => 'contact@acme.com',
            'phone' => '+251911223344',
            'location' => 'Addis Ababa',
            'industry' => 'Technology',
            'approval_status' => 'approved',
        ]);

        $category = Category::create([
            'name' => 'Engineering',
            'slug' => 'engineering',
        ]);

        $this->jobPost = JobPost::factory()->create([
            'employer_id' => $this->employer->id,
            'category_id' => $category->id,
            'title' => 'Senior Backend Engineer',
            'slug' => 'senior-backend-engineer',
            'description' => 'Great job opportunity.',
            'job_type' => JobType::FULL_TIME,
            'status' => JobStatus::PUBLISHED,
        ]);

        $this->employeeUser = User::factory()->create([
            'role' => UserRole::EMPLOYEE,
            'email_verified_at' => now(),
        ]);

        $this->application = Application::factory()->create([
            'job_post_id' => $this->jobPost->id,
            'user_id' => $this->employeeUser->id,
            'status' => ApplicationStatus::UNDER_REVIEW,
        ]);
    }

    public function test_employee_gets_notification_when_hired_by_employer(): void
    {
        $response = $this->actingAs($this->employerUser, 'sanctum')
            ->putJson("/api/v1/employer/applications/{$this->application->id}/status", [
                'status' => 'hired',
            ]);

        $response->assertOk();

        // Check notification created in database for the employee
        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $this->employeeUser->id,
            'notifiable_type' => User::class,
        ]);

        $notification = $this->employeeUser->notifications()->first();
        $this->assertNotNull($notification);
        $this->assertEquals('application_status_changed', $notification->data['type']);
        $this->assertEquals('hired', $notification->data['status']);
        $this->assertEquals('Congratulations! You are Hired', $notification->data['title']);
        $this->assertStringContainsString('Acme Corporation', $notification->data['message']);
    }

    public function test_employee_gets_notification_when_rejected_by_employer(): void
    {
        $response = $this->actingAs($this->employerUser, 'sanctum')
            ->putJson("/api/v1/employer/applications/{$this->application->id}/status", [
                'status' => 'rejected',
            ]);

        $response->assertOk();

        $notification = $this->employeeUser->notifications()->first();
        $this->assertNotNull($notification);
        $this->assertEquals('application_status_changed', $notification->data['type']);
        $this->assertEquals('rejected', $notification->data['status']);
        $this->assertEquals('Application Status: Rejected', $notification->data['title']);
        $this->assertStringContainsString('rejected', $notification->data['message']);
    }

    public function test_employee_gets_notification_when_hired_by_admin(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/admin/applications/{$this->application->id}/status", [
                'status' => 'hired',
            ]);

        $response->assertOk();

        $notification = $this->employeeUser->notifications()->first();
        $this->assertNotNull($notification);
        $this->assertEquals('application_status_changed', $notification->data['type']);
        $this->assertEquals('hired', $notification->data['status']);
        $this->assertEquals('Congratulations! You are Hired', $notification->data['title']);
    }

    public function test_employee_gets_notification_when_rejected_by_admin(): void
    {
        $response = $this->actingAs($this->admin, 'sanctum')
            ->patchJson("/api/v1/admin/applications/{$this->application->id}/status", [
                'status' => 'rejected',
            ]);

        $response->assertOk();

        $notification = $this->employeeUser->notifications()->first();
        $this->assertNotNull($notification);
        $this->assertEquals('application_status_changed', $notification->data['type']);
        $this->assertEquals('rejected', $notification->data['status']);
        $this->assertEquals('Application Status: Rejected', $notification->data['title']);
    }

    public function test_employee_can_view_notifications_list(): void
    {
        $this->employeeUser->notify(new ApplicationStatusChangedNotification(
            $this->application,
            $this->jobPost,
            ApplicationStatus::HIRED
        ));

        $response = $this->actingAs($this->employeeUser, 'sanctum')
            ->getJson('/api/v1/employee/notifications');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.data.type', 'application_status_changed')
            ->assertJsonPath('data.data.0.data.status', 'hired')
            ->assertJsonPath('data.data.0.is_read', false);
    }

    public function test_employee_can_filter_unread_notifications(): void
    {
        $this->employeeUser->notify(new ApplicationStatusChangedNotification(
            $this->application,
            $this->jobPost,
            ApplicationStatus::HIRED
        ));

        $notification = $this->employeeUser->notifications()->first();
        $this->assertNotNull($notification);
        $notification->markAsRead();

        // Add second unread notification
        $this->employeeUser->notify(new ApplicationStatusChangedNotification(
            $this->application,
            $this->jobPost,
            ApplicationStatus::REJECTED
        ));

        $response = $this->actingAs($this->employeeUser, 'sanctum')
            ->getJson('/api/v1/employee/notifications?unread=1');

        $response->assertOk()
            ->assertJsonCount(1, 'data.data')
            ->assertJsonPath('data.data.0.data.status', 'rejected');
    }

    public function test_employee_can_get_unread_count(): void
    {
        $this->employeeUser->notify(new ApplicationStatusChangedNotification(
            $this->application,
            $this->jobPost,
            ApplicationStatus::HIRED
        ));

        $response = $this->actingAs($this->employeeUser, 'sanctum')
            ->getJson('/api/v1/employee/notifications/unread-count');

        $response->assertOk()
            ->assertJsonPath('data.unread_count', 1);
    }

    public function test_employee_can_mark_notification_as_read(): void
    {
        $this->employeeUser->notify(new ApplicationStatusChangedNotification(
            $this->application,
            $this->jobPost,
            ApplicationStatus::HIRED
        ));

        $notification = $this->employeeUser->notifications()->first();
        $this->assertNotNull($notification);

        $response = $this->actingAs($this->employeeUser, 'sanctum')
            ->patchJson("/api/v1/employee/notifications/{$notification->id}/read");

        $response->assertOk()
            ->assertJsonPath('data.is_read', true);

        $this->assertEquals(0, $this->employeeUser->unreadNotifications()->count());
    }

    public function test_employee_can_mark_all_notifications_as_read(): void
    {
        $this->employeeUser->notify(new ApplicationStatusChangedNotification(
            $this->application,
            $this->jobPost,
            ApplicationStatus::HIRED
        ));
        $this->employeeUser->notify(new ApplicationStatusChangedNotification(
            $this->application,
            $this->jobPost,
            ApplicationStatus::REJECTED
        ));

        $this->assertEquals(2, $this->employeeUser->unreadNotifications()->count());

        $response = $this->actingAs($this->employeeUser, 'sanctum')
            ->postJson('/api/v1/employee/notifications/mark-all-read');

        $response->assertOk();
        $this->assertEquals(0, $this->employeeUser->unreadNotifications()->count());
    }

    public function test_employee_can_delete_notification(): void
    {
        $this->employeeUser->notify(new ApplicationStatusChangedNotification(
            $this->application,
            $this->jobPost,
            ApplicationStatus::HIRED
        ));

        $notification = $this->employeeUser->notifications()->first();
        $this->assertNotNull($notification);

        $response = $this->actingAs($this->employeeUser, 'sanctum')
            ->deleteJson("/api/v1/employee/notifications/{$notification->id}");

        $response->assertOk();
        $this->assertEquals(0, $this->employeeUser->notifications()->count());
    }

    public function test_employer_cannot_access_employee_notifications(): void
    {
        $response = $this->actingAs($this->employerUser, 'sanctum')
            ->getJson('/api/v1/employee/notifications');

        $response->assertForbidden();
    }
}
