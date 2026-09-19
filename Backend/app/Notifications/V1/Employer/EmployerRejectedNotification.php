<?php

declare(strict_types=1);

namespace App\Notifications\V1\Employer;

use App\Models\Employer;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class EmployerRejectedNotification extends Notification
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
            ->subject("Company Profile Update — {$this->employer->company_name}")
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line("Your company profile for '{$this->employer->company_name}' could not be approved as submitted.")
            ->line('Please review your company details, make any necessary updates, and resubmit for approval.')
            ->action('Update Company Profile', url('/company-profile'))
            ->line('You are receiving this email because you registered as an employer on HireStream.')
            ->line('To manage notification preferences, visit your account settings.')
            ->salutation('— The HireStream Team');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'employer_rejected',
            'title' => 'Company Profile Rejected',
            'message' => "Your company profile for '{$this->employer->company_name}' could not be approved. Please review your company details and update them.",
            'employer_id' => $this->employer->id,
            'company_name' => $this->employer->company_name,
            'action_url' => '/company-profile',
            'rejected_at' => now()->toIso8601String(),
        ];
    }
}
