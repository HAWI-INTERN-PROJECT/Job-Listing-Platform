<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $subject ?? 'HireStream Notification' }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
        <tr>
            <td align="center">
                <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                    {{-- Header --}}
                    <tr>
                        <td style="background-color:#000000;padding:24px 32px;">
                            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">HireStream</span>
                        </td>
                    </tr>

                    {{-- Body --}}
                    <tr>
                        <td style="padding:32px;">
                            @if (!empty($greeting))
                                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;font-weight:600;">
                                    {{ $greeting }}
                                </p>
                            @endif

                            @foreach ($introLines ?? [] as $line)
                                <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#3f3f46;">
                                    {{ $line }}
                                </p>
                            @endforeach

                            @if (!empty($actionText) && !empty($actionUrl))
                                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;">
                                    <tr>
                                        <td style="border-radius:8px;background-color:#000000;">
                                            <a href="{{ $actionUrl }}"
                                               style="display:inline-block;padding:12px 24px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                                                {{ $actionText }}
                                            </a>
                                        </td>
                                    </tr>
                                </table>
                            @endif

                            @foreach ($outroLines ?? [] as $line)
                                <p style="margin:0 0 12px;font-size:14px;line-height:1.6;color:#71717a;">
                                    {{ $line }}
                                </p>
                            @endforeach

                            @if (!empty($salutation))
                                <p style="margin:24px 0 0;font-size:15px;line-height:1.6;color:#3f3f46;">
                                    {{ $salutation }}
                                </p>
                            @endif
                        </td>
                    </tr>

                    {{-- Footer --}}
                    <tr>
                        <td style="background-color:#fafafa;border-top:1px solid #e4e4e7;padding:20px 32px;">
                            <p style="margin:0;font-size:12px;line-height:1.6;color:#a1a1aa;">
                                © {{ date('Y') }} HireStream. All rights reserved.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
