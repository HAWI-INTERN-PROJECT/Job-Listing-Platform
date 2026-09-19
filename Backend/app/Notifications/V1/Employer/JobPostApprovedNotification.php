<?php

declare(strict_types=1);

namespace App\Notifications\V1\Employer;

use App\Models\JobPost;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class JobPostApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public JobPost $jobPost
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject("Job Post Approved — {$this->jobPost->title}")
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line("Great news! Your job post '{$this->jobPost->title}' has been approved and is now live on HireStream.")
            ->line('Candidates can now find and apply to your listing.')
            ->action('View Job Post', url('/my-job-posts'))
            ->line('You are receiving this email because you posted a job on HireStream.')
            ->line('To manage notification preferences, visit your account settings.')
            ->salutation('— The HireStream Team')
            ->view('emails.notifications.employer.job-post-approved');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'job_post_approved',
            'title' => 'Job Post Approved & Published',
            'message' => "Your job post '{$this->jobPost->title}' has been approved and is now live.",
            'job_post_id' => $this->jobPost->id,
            'job_title' => $this->jobPost->title,
            'action_url' => '/my-job-posts',
            'approved_at' => now()->toIso8601String(),
        ];
    }
}
