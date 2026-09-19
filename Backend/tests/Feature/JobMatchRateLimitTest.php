<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Enums\JobStatus;
use App\Enums\JobType;
use App\Enums\UserRole;
use App\Models\Category;
use App\Models\Employer;
use App\Models\JobPost;
use App\Models\User;
use App\Notifications\V1\Employee\JobMatchNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class JobMatchRateLimitTest extends TestCase
{
    use RefreshDatabase;

    private User $employee;

    private JobPost $jobPost;

    protected function setUp(): void
    {
        parent::setUp();

        $employerUser = User::factory()->create([
            'role' => UserRole::EMPLOYER,
            'email_verified_at' => now(),
        ]);

        $employer = Employer::create([
            'user_id' => $employerUser->id,
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
            'employer_id' => $employer->id,
            'category_id' => $category->id,
            'title' => 'Senior Backend Engineer',
            'slug' => 'senior-backend-engineer',
            'description' => 'Great job opportunity.',
            'job_type' => JobType::FULL_TIME,
            'status' => JobStatus::PUBLISHED,
        ]);

        $this->employee = User::factory()->create([
            'role' => UserRole::EMPLOYEE,
            'email_verified_at' => now(),
        ]);
    }

    public function test_mail_channel_sends_when_no_recent_job_match_notification(): void
    {
        $notification = new JobMatchNotification($this->jobPost, 85, []);

        $this->assertTrue($notification->shouldSend($this->employee, 'mail'));
    }

    public function test_mail_channel_is_rate_limited_when_recent_job_match_notification_exists(): void
    {
        // First notification — recorded in the database (bypasses actual send)
        $this->employee->notify(new JobMatchNotification($this->jobPost, 85, []));

        $second = new JobMatchNotification($this->jobPost, 90, []);

        $this->assertFalse($second->shouldSend($this->employee, 'mail'));
    }

    public function test_database_channel_is_never_rate_limited(): void
    {
        $this->employee->notify(new JobMatchNotification($this->jobPost, 85, []));

        $second = new JobMatchNotification($this->jobPost, 90, []);

        $this->assertTrue($second->shouldSend($this->employee, 'database'));
    }

    public function test_mail_channel_resumes_after_24_hours(): void
    {
        // Insert an old notification directly with a backdated timestamp
        \DB::table('notifications')->insert([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => JobMatchNotification::class,
            'notifiable_type' => User::class,
            'notifiable_id' => $this->employee->id,
            'data' => json_encode(['type' => 'job_match']),
            'read_at' => null,
            'created_at' => now()->subDays(2),
            'updated_at' => now()->subDays(2),
        ]);

        $notification = new JobMatchNotification($this->jobPost, 85, []);

        $this->assertTrue($notification->shouldSend($this->employee, 'mail'));
    }
}
