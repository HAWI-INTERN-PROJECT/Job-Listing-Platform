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
use App\Notifications\V1\Employer\EmployerApprovedNotification;
use App\Notifications\V1\Employer\EmployerRejectedNotification;
use App\Notifications\V1\Employer\JobPostApprovedNotification;
use App\Notifications\V1\Employer\JobPostRejectedNotification;
use App\Notifications\V1\Employer\NewApplicationReceivedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmployerNotificationMailTest extends TestCase
{
    use RefreshDatabase;

    private User $employerUser;

    private Employer $employer;

    private User $employeeUser;

    private JobPost $jobPost;

    private Application $application;

    protected function setUp(): void
    {
        parent::setUp();

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
            'name' => 'Jane Applicant',
            'email' => 'jane@applicant.com',
        ]);

        $this->application = Application::factory()->create([
            'job_post_id' => $this->jobPost->id,
            'user_id' => $this->employeeUser->id,
            'status' => ApplicationStatus::SUBMITTED,
        ]);
    }

    public function test_new_application_received_notification_has_database_and_mail_channels(): void
    {
        $notification = new NewApplicationReceivedNotification(
            $this->application,
            $this->jobPost,
            $this->employeeUser
        );

        $this->assertSame(['database', 'mail'], $notification->via($this->employerUser));

        $mail = $notification->toMail($this->employerUser);
        $this->assertSame('New Application Received — Senior Backend Engineer', $mail->subject);
        $this->assertStringContainsString('Hello', $mail->greeting);
        $this->assertStringContainsString('Jane Applicant', implode(' ', $mail->introLines));
        $this->assertStringContainsString('jane@applicant.com', implode(' ', $mail->introLines));

        $array = $notification->toArray($this->employerUser);
        $this->assertSame('new_application_received', $array['type']);
        $this->assertSame('Jane Applicant', $array['applicant_name']);
        $this->assertSame('jane@applicant.com', $array['applicant_email']);
        $this->assertSame($this->application->id, $array['application_id']);
    }

    public function test_job_post_approved_notification_has_database_and_mail_channels(): void
    {
        $notification = new JobPostApprovedNotification($this->jobPost);

        $this->assertSame(['database', 'mail'], $notification->via($this->employerUser));

        $mail = $notification->toMail($this->employerUser);
        $this->assertSame('Job Post Approved — Senior Backend Engineer', $mail->subject);
        $this->assertStringContainsString('Senior Backend Engineer', implode(' ', $mail->introLines));

        $array = $notification->toArray($this->employerUser);
        $this->assertSame('job_post_approved', $array['type']);
        $this->assertSame('Senior Backend Engineer', $array['job_title']);
        $this->assertSame($this->jobPost->id, $array['job_post_id']);
    }

    public function test_job_post_rejected_notification_has_database_and_mail_channels(): void
    {
        $reason = 'Incomplete job description';
        $notification = new JobPostRejectedNotification($this->jobPost, $reason);

        $this->assertSame(['database', 'mail'], $notification->via($this->employerUser));

        $mail = $notification->toMail($this->employerUser);
        $this->assertSame('Job Post Needs Changes — Senior Backend Engineer', $mail->subject);
        $this->assertStringContainsString($reason, implode(' ', $mail->introLines));

        $array = $notification->toArray($this->employerUser);
        $this->assertSame('job_post_rejected', $array['type']);
        $this->assertSame($reason, $array['rejection_reason']);
        $this->assertSame($this->jobPost->id, $array['job_post_id']);
    }

    public function test_employer_approved_notification_has_database_and_mail_channels(): void
    {
        $notification = new EmployerApprovedNotification($this->employer);

        $this->assertSame(['database', 'mail'], $notification->via($this->employerUser));

        $mail = $notification->toMail($this->employerUser);
        $this->assertSame('Welcome to HireStream — Acme Corporation approved', $mail->subject);
        $this->assertStringContainsString('Acme Corporation', implode(' ', $mail->introLines));

        $array = $notification->toArray($this->employerUser);
        $this->assertSame('employer_approved', $array['type']);
        $this->assertSame('Acme Corporation', $array['company_name']);
        $this->assertSame($this->employer->id, $array['employer_id']);
    }

    public function test_employer_rejected_notification_has_database_and_mail_channels(): void
    {
        $notification = new EmployerRejectedNotification($this->employer);

        $this->assertSame(['database', 'mail'], $notification->via($this->employerUser));

        $mail = $notification->toMail($this->employerUser);
        $this->assertSame('Company Profile Update — Acme Corporation', $mail->subject);
        $this->assertStringContainsString('Acme Corporation', implode(' ', $mail->introLines));

        $array = $notification->toArray($this->employerUser);
        $this->assertSame('employer_rejected', $array['type']);
        $this->assertSame('Acme Corporation', $array['company_name']);
        $this->assertSame($this->employer->id, $array['employer_id']);
    }

    public function test_notify_dispatches_new_application_notification(): void
    {
        \Illuminate\Support\Facades\Notification::fake();

        $this->employerUser->notify(new NewApplicationReceivedNotification(
            $this->application,
            $this->jobPost,
            $this->employeeUser
        ));

        \Illuminate\Support\Facades\Notification::assertSentTo(
            $this->employerUser,
            NewApplicationReceivedNotification::class
        );
    }
}
