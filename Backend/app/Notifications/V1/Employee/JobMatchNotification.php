<?php

declare(strict_types=1);

namespace App\Notifications\V1\Employee;

use App\Models\JobPost;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class JobMatchNotification extends Notification
{
    use Queueable;

    /**
     * @param  array<string, mixed>  $reasons
     */
    public function __construct(
        public JobPost $jobPost,
        public int $matchScore,
        public array $reasons = []
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
     * Determine if the notification should be sent on the given channel.
     *
     * Rate-limits the mail channel so a user receives at most one
     * job-match email per 24 hours, regardless of how many jobs are matched.
     */
    public function shouldSend(object $notifiable, string $channel): bool
    {
        if ($channel !== 'mail') {
            return true;
        }

        return ! $notifiable->notifications()
            ->where('data->type', 'job_match')
            ->where('created_at', '>', now()->subDay())
            ->exists();
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): \Illuminate\Notifications\Messages\MailMessage
    {
        $companyName = $this->jobPost->employer->company_name ?? 'An employer';
        $matchedSkills = (array) ($this->reasons['matched_skills'] ?? []);
        $skillsPreview = ! empty($matchedSkills)
            ? ' Matches your skills: ' . implode(', ', array_slice($matchedSkills, 0, 3)) . '.'
            : '';

        $mail = (new \Illuminate\Notifications\Messages\MailMessage)
            ->subject("New Job Match ({$this->matchScore}%): {$this->jobPost->title}")
            ->greeting('Hello ' . $notifiable->name . ',')
            ->line("We found a position matching your profile: '{$this->jobPost->title}' at {$companyName}.{$skillsPreview}")
            ->line("Match score: {$this->matchScore}%");

        if (! empty($matchedSkills)) {
            $mail->line('Top matched skills: ' . implode(', ', array_slice($matchedSkills, 0, 5)));
        }

        $mail->action('View Job Post', url("/jobs/{$this->jobPost->slug}"))
            ->line('You are receiving this email because this job matches your profile on HireStream.')
            ->line('To manage notification preferences, visit your account settings.')
            ->salutation('— The HireStream Team');

        return $mail;
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $companyName = $this->jobPost->employer->company_name ?? 'An employer';
        $matchedSkills = (array) ($this->reasons['matched_skills'] ?? []);
        $skillsPreview = ! empty($matchedSkills)
            ? ' Matches your skills: ' . implode(', ', array_slice($matchedSkills, 0, 3)) . '.'
            : '';

        return [
            'type' => 'job_match',
            'title' => "New Job Match: {$this->matchScore}% Match",
            'message' => "We found a position matching your profile: '{$this->jobPost->title}' at {$companyName}.{$skillsPreview}",
            'job_post_id' => $this->jobPost->id,
            'job_title' => $this->jobPost->title,
            'job_slug' => $this->jobPost->slug,
            'company_name' => $companyName,
            'match_score' => $this->matchScore,
            'matched_skills' => $matchedSkills,
            'action_url' => "/jobs/{$this->jobPost->slug}",
            'created_at' => now()->toIso8601String(),
        ];
    }
}
