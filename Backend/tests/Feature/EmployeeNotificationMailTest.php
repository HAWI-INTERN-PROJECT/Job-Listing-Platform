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
use App\Models\Interview;
use App\Models\JobPost;
use App\Models\User;
use App\Notifications\V1\Employee\ApplicationStatusChangedNotification;
use App\Notifications\V1\Employee\InterviewScheduledNotification;
use App\Notifications\V1\Employee\JobMatchNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EmployeeNotificationMailTest extends TestCase
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
        ]);

        $this->application = Application::factory()->create([
            'job_post_id' => $this->jobPost->id,
            'user_id' => $this->employeeUser->id,
            'status' => ApplicationStatus::UNDER_REVIEW,
        ]);
    }

    public function test_application_status_changed_notification_has_database_and_mail_channels(): void
    {
        $notification = new ApplicationStatusChangedNotification(
            $this->application,
            $this->jobPost,
            ApplicationStatus::HIRED
        );

        $this->assertSame(['database', 'mail'], $notification->via($this->employeeUser));

        $mail = $notification->toMail($this->employeeUser);
        $this->assertSame('Congratulations — You Are Hired!', $mail->subject);
        $this->assertStringContainsString('Hello', $mail->greeting);
        $this->assertStringContainsString('Acme Corporation', implode(' ', $mail->introLines));

        $array = $notification->toArray($this->employeeUser);
        $this->assertSame('application_status_changed', $array['type']);
        $this->assertSame('hired', $array['status']);
        $this->assertSame('Congratulations! You are Hired', $array['title']);
        $this->assertSame('Acme Corporation', $array['company_name']);
    }

    public function test_interview_scheduled_notification_has_database_and_mail_channels(): void
    {
        $interview = Interview::factory()->create([
            'application_id' => $this->application->id,
            'employer_id' => $this->employer->id,
            'user_id' => $this->employeeUser->id,
            'job_post_id' => $this->jobPost->id,
            'scheduled_at' => now()->addDays(3),
        ]);

        $notification = new InterviewScheduledNotification($interview, false);

        $this->assertSame(['database', 'mail'], $notification->via($this->employeeUser));

        $mail = $notification->toMail($this->employeeUser);
        $this->assertSame('Interview Scheduled — Senior Backend Engineer', $mail->subject);
        $this->assertStringContainsString('Acme Corporation', implode(' ', $mail->introLines));

        $array = $notification->toArray($this->employeeUser);
        $this->assertSame('interview_scheduled', $array['type']);
        $this->assertSame('Acme Corporation', $array['company_name']);
        $this->assertSame('https://meet.google.com/test-link', $array['meeting_link']);
        $this->assertSame($interview->id, $array['interview_id']);
    }

    public function test_interview_rescheduled_notification_uses_rescheduled_subject(): void
    {
        $interview = Interview::factory()->create([
            'application_id' => $this->application->id,
            'employer_id' => $this->employer->id,
            'user_id' => $this->employeeUser->id,
            'job_post_id' => $this->jobPost->id,
            'scheduled_at' => now()->addDays(5),
        ]);

        $notification = new InterviewScheduledNotification($interview, true);

        $mail = $notification->toMail($this->employeeUser);
        $this->assertSame('Interview Rescheduled — Senior Backend Engineer', $mail->subject);

        $array = $notification->toArray($this->employeeUser);
        $this->assertSame('interview_rescheduled', $array['type']);
        $this->assertSame('Interview Rescheduled', $array['title']);
    }

    public function test_job_match_notification_has_database_and_mail_channels(): void
    {
        $reasons = ['matched_skills' => ['PHP', 'Laravel', 'MySQL']];
        $notification = new JobMatchNotification($this->jobPost, 88, $reasons);

        $this->assertSame(['database', 'mail'], $notification->via($this->employeeUser));

        $mail = $notification->toMail($this->employeeUser);
        $this->assertSame('New Job Match (88%): Senior Backend Engineer', $mail->subject);
        $this->assertStringContainsString('Acme Corporation', implode(' ', $mail->introLines));
        $this->assertStringContainsString('PHP', implode(' ', $mail->introLines));

        $array = $notification->toArray($this->employeeUser);
        $this->assertSame('job_match', $array['type']);
        $this->assertSame(88, $array['match_score']);
        $this->assertSame('senior-backend-engineer', $array['job_slug']);
        $this->assertSame(['PHP', 'Laravel', 'MySQL'], $array['matched_skills']);
    }

    public function test_notify_dispatches_application_status_notification(): void
    {
        Notification::fake();

        $this->employeeUser->notify(new ApplicationStatusChangedNotification(
            $this->application,
            $this->jobPost,
            ApplicationStatus::HIRED
        ));

        Notification::assertSentTo(
            $this->employeeUser,
            ApplicationStatusChangedNotification::class
        );
    }

    public function test_notify_dispatches_interview_notification(): void
    {
        Notification::fake();

        $interview = Interview::factory()->create([
            'application_id' => $this->application->id,
            'employer_id' => $this->employer->id,
            'user_id' => $this->employeeUser->id,
            'job_post_id' => $this->jobPost->id,
        ]);

        $this->employeeUser->notify(new InterviewScheduledNotification($interview, false));

        Notification::assertSentTo(
            $this->employeeUser,
            InterviewScheduledNotification::class
        );
    }

    public function test_notify_dispatches_job_match_notification(): void
    {
        Notification::fake();

        $this->employeeUser->notify(new JobMatchNotification($this->jobPost, 88, []));

        Notification::assertSentTo(
            $this->employeeUser,
            JobMatchNotification::class
        );
    }
}
