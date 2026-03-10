<?php
// ─────────────────────────────────────────────────────────────
// mail.php — Email sending helper (stub)
// Replace with a real mailer (PHPMailer, Mailgun SDK, etc.)
// once SMTP credentials are available.
// ─────────────────────────────────────────────────────────────

/**
 * Send a plain-text email.
 *
 * @param string $to      Recipient email address.
 * @param string $subject Email subject.
 * @param string $body    Plain-text body.
 * @return bool           True on success, false on failure.
 */
function sendMail(string $to, string $subject, string $body): bool {
    // TODO: Integrate PHPMailer / Mailgun / SendGrid for production use.

    // Guard against header injection: reject any newlines in to/subject
    if (strpbrk($to, "\r\n") !== false || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    if (strpbrk($subject, "\r\n") !== false) {
        return false;
    }

    $from    = defined('APP_MAIL_FROM') ? APP_MAIL_FROM : 'noreply@toro.ae';
    $headers = "From: $from\r\nContent-Type: text/plain; charset=utf-8\r\n";

    return @mail($to, $subject, $body, $headers);
}

/**
 * Send an HTML email.
 *
 * @param string $to      Recipient email address.
 * @param string $subject Email subject.
 * @param string $html    HTML body.
 * @return bool
 */
function sendHtmlMail(string $to, string $subject, string $html): bool {
    if (strpbrk($to, "\r\n") !== false || !filter_var($to, FILTER_VALIDATE_EMAIL)) {
        return false;
    }
    if (strpbrk($subject, "\r\n") !== false) {
        return false;
    }

    $from    = defined('APP_MAIL_FROM') ? APP_MAIL_FROM : 'noreply@toro.ae';
    $headers = "From: $from\r\nMIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n";

    return @mail($to, $subject, $html, $headers);
}
