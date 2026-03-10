<?php
// ─────────────────────────────────────────────────────────────
// sms.php — SMS sending helper (stub)
// Replace with a real SMS gateway (Twilio, Unifonic, etc.)
// once API credentials are available.
// ─────────────────────────────────────────────────────────────

/**
 * Send an SMS message to a phone number.
 *
 * @param string $to      Recipient phone number (E.164 format, e.g. +971501234567).
 * @param string $message Message body (max 160 chars for a single SMS).
 * @return bool           True on success, false on failure.
 */
function sendSMS(string $to, string $message): bool {
    // TODO: Integrate Twilio / Unifonic / Ooredoo SMS API
    // Example with Twilio:
    //   $client = new Twilio\Rest\Client(TWILIO_SID, TWILIO_TOKEN);
    //   $client->messages->create($to, ['from' => TWILIO_FROM, 'body' => $message]);
    //   return true;

    // Stub: log for development
    error_log("[SMS] To: $to | Message: $message");

    return false; // not yet implemented
}

/**
 * Send an OTP verification SMS.
 *
 * @param string $to   Phone number.
 * @param string $otp  One-time password code.
 */
function sendOtpSMS(string $to, string $otp): bool {
    $message = "TORO: رمز التحقق الخاص بك هو $otp — Your verification code is $otp";
    return sendSMS($to, $message);
}
