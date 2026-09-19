<?php

declare(strict_types=1);

namespace App\Notifications\V1\Admin;

use App\Models\JobPost;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class JobSubmittedForReviewNotification extends Notification
{
    use Queueable;

    public function __construct(
        public JobPost $jobPost
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return list<string>
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
        $companyName = $this->jobPost->employer->company_name ?? 'An employer';

        return (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject("New Job Submitted for Review — {$this->jobPost->title}")
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line("'{$this->jobPost->title}' was submitted by {$companyName} and is awaiting review.")
            ->line('Please review and approve or reject the job post.')
            ->action('Review Job Post', url('/admin/jobs'))
            ->line('You are receiving this email as an administrator of HireStream.')
            ->line('To manage notification preferences, visit your account settings.')
            ->salutation('— The HireStream Team')
            ->view('emails.notifications.admin.job-submitted-for-review');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $companyName = $this->jobPost->employer->company_name ?? 'An employer';

        return [
            'type' => 'job_submitted_for_review',
            'title' => 'New Job Submitted for Review',
            'message' => "'{$this->jobPost->title}' was submitted by {$companyName} and is awaiting review.",
            'job_post_id' => $this->jobPost->id,
            'job_title' => $this->jobPost->title,
            'company_name' => $companyName,
            'action_url' => '/admin/jobs',
        ];
    }
}
