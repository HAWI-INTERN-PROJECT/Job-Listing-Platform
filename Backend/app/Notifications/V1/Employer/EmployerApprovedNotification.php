<?php

declare(strict_types=1);

namespace App\Notifications\V1\Employer;

use App\Models\Employer;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class EmployerApprovedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public Employer $employer
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
            ->subject("Welcome to HireStream — {$this->employer->company_name} approved")
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line("Congratulations! Your company profile for '{$this->employer->company_name}' has been approved by our admin team.")
            ->line('You can now post jobs and start receiving applications from candidates.')
            ->action('View Company Profile', url('/company-profile'))
            ->line('You are receiving this email because you registered as an employer on HireStream.')
            ->line('To manage notification preferences, visit your account settings.')
            ->salutation('— The HireStream Team')
            ->view('emails.notifications.employer.employer-approved');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'employer_approved',
            'title' => 'Company Profile Approved',
            'message' => "Congratulations! Your company profile for '{$this->employer->company_name}' has been approved by our admin team.",
            'employer_id' => $this->employer->id,
            'company_name' => $this->employer->company_name,
            'action_url' => '/company-profile',
            'approved_at' => now()->toIso8601String(),
        ];
    }
}
