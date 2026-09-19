<?php

declare(strict_types=1);

namespace App\Notifications\V1\Auth;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewLoginDetectedNotification extends Notification
{
    use Queueable;

    public function __construct(
        public string $browser,
        public string $platform,
        public string $ip,
        public string $when,
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return list<string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New login to your HireStream account')
            ->greeting('Hi ' . $notifiable->name . ',')
            ->line('We noticed a new login to your HireStream account.')
            ->line("Device: {$this->browser} on {$this->platform}")
            ->line("IP address: {$this->ip}")
            ->line("When: {$this->when}")
            ->line('If this was you, you can safely ignore this email.')
            ->line('If this was not you, please change your password immediately.')
            ->action('Change Password', url('/change-password'))
            ->line('For your security, we recommend using a unique password.')
            ->salutation('— The HireStream Team')
            ->view('emails.notifications.auth.new-login-detected');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'type' => 'new_login_detected',
            'title' => 'New Login Detected',
            'message' => "A new login was detected from {$this->browser} on {$this->platform}.",
            'browser' => $this->browser,
            'platform' => $this->platform,
            'ip' => $this->ip,
            'when' => $this->when,
        ];
    }
}
