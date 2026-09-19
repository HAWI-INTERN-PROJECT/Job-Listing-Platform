@include('emails.notifications.layout', [
    'subject' => $subject,
    'greeting' => $greeting,
    'introLines' => $introLines,
    'actionText' => $actionText,
    'actionUrl' => $actionUrl,
    'outroLines' => $outroLines,
    'salutation' => $salutation,
])
