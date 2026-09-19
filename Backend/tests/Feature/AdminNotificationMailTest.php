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
use App\Notifications\V1\Admin\EmployerPendingApprovalNotification;
use App\Notifications\V1\Admin\JobSubmittedForReviewNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AdminNotificationMailTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private User $employerUser;

    private Employer $employer;

    private JobPost $jobPost;

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
            'approval_status' => 'pending',
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
            'status' => JobStatus::PENDING_APPROVAL,
        ]);
    }

    public function test_employer_pending_approval_notification_has_database_and_mail_channels(): void
    {
        $notification = new EmployerPendingApprovalNotification($this->employer);

        $this->assertSame(['database', 'mail'], $notification->via($this->admin));

        $mail = $notification->toMail($this->admin);
        $this->assertSame('New Employer Awaiting Approval — Acme Corporation', $mail->subject);
        $this->assertStringContainsString('Hello', $mail->greeting);
        $this->assertStringContainsString('Acme Corporation', implode(' ', $mail->introLines));

        $array = $notification->toArray($this->admin);
        $this->assertSame('employer_pending_approval', $array['type']);
        $this->assertSame('Acme Corporation', $array['company_name']);
        $this->assertSame($this->employer->id, $array['employer_id']);
        $this->assertSame('/admin/companies', $array['action_url']);
    }

    public function test_job_submitted_for_review_notification_has_database_and_mail_channels(): void
    {
        $notification = new JobSubmittedForReviewNotification($this->jobPost);

        $this->assertSame(['database', 'mail'], $notification->via($this->admin));

        $mail = $notification->toMail($this->admin);
        $this->assertSame('New Job Submitted for Review — Senior Backend Engineer', $mail->subject);
        $this->assertStringContainsString('Acme Corporation', implode(' ', $mail->introLines));
        $this->assertStringContainsString('Senior Backend Engineer', implode(' ', $mail->introLines));

        $array = $notification->toArray($this->admin);
        $this->assertSame('job_submitted_for_review', $array['type']);
        $this->assertSame('Senior Backend Engineer', $array['job_title']);
        $this->assertSame('Acme Corporation', $array['company_name']);
        $this->assertSame($this->jobPost->id, $array['job_post_id']);
        $this->assertSame('/admin/jobs', $array['action_url']);
    }

    public function test_notify_dispatches_employer_pending_approval_notification(): void
    {
        Notification::fake();

        $this->admin->notify(new EmployerPendingApprovalNotification($this->employer));

        Notification::assertSentTo(
            $this->admin,
            EmployerPendingApprovalNotification::class
        );
    }

    public function test_notify_dispatches_job_submitted_for_review_notification(): void
    {
        Notification::fake();

        $this->admin->notify(new JobSubmittedForReviewNotification($this->jobPost));

        Notification::assertSentTo(
            $this->admin,
            JobSubmittedForReviewNotification::class
        );
    }
}
