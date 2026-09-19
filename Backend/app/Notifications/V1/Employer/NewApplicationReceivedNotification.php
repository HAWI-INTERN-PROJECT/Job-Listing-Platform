<?php

declare(strict_types=1);

namespace App\Notifications\V1\Employer;

use App\Models\Application;
use App\Models\JobPost;
use App\Models\User;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class NewApplicationReceivedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Application $application,
        public JobPost $jobPost,
        public User $applicant
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
            ->subject("New Application Received — {$this->jobPost->title}")
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line("You have a new application for '{$this->jobPost->title}'.")
            ->line("Candidate: {$this->applicant->name}")
            ->line("Email: {$this->applicant->email}")
            ->action('View Application', url('/job-applicants'))
            ->line('You are receiving this email because you posted a job on HireStream.')
            ->line('To manage notification preferences, visit your account settings.')
            ->salutation('— The HireStream Team')
            ->view('emails.notifications.employer.new-application-received');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_application_received',
            'title' => 'New Job Application Received',
            'message' => "Candidate {$this->applicant->name} has applied for your position '{$this->jobPost->title}'.",
            'application_id' => $this->application->id,
            'job_post_id' => $this->jobPost->id,
            'job_title' => $this->jobPost->title,
            'applicant_name' => $this->applicant->name,
            'applicant_email' => $this->applicant->email,
            'action_url' => '/job-applicants',
            'applied_at' => now()->toIso8601String(),
        ];
    }
}
