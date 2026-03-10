<?php
// ─────────────────────────────────────────────────────────────
// CSRF.php — CSRF token generation and validation
// ─────────────────────────────────────────────────────────────

class CSRF {
    // No visibility modifier — compatible with PHP 7.0
    const SESSION_KEY = 'toro_csrf_token';
    const HEADER_NAME = 'X-CSRF-Token';

    /**
     * Generate and store a new CSRF token in the session.
     */
    public static function generateToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $token = bin2hex(random_bytes(32));
        $_SESSION[self::SESSION_KEY] = $token;
        return $token;
    }

    /**
     * Retrieve the current session CSRF token (generate one if missing).
     */
    public static function getToken() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        if (empty($_SESSION[self::SESSION_KEY])) {
            return self::generateToken();
        }
        return $_SESSION[self::SESSION_KEY];
    }

    /**
     * Validate a submitted CSRF token using a constant-time comparison.
     */
    public static function validateToken($submitted) {
        if ($submitted === null || $submitted === '') {
            return false;
        }
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $stored = isset($_SESSION[self::SESSION_KEY]) ? $_SESSION[self::SESSION_KEY] : '';
        return $stored !== '' && hash_equals($stored, $submitted);
    }

    /**
     * Extract the CSRF token from the request (header first, then body).
     */
    public static function fromRequest() {
        // From X-CSRF-Token header
        $headers = function_exists('getallheaders') ? array_change_key_case(getallheaders(), CASE_LOWER) : [];
        $headerKey = strtolower(self::HEADER_NAME);
        if (!empty($headers[$headerKey])) {
            return trim($headers[$headerKey]);
        }

        // From JSON body
        $raw  = file_get_contents('php://input');
        $body = $raw ? (json_decode($raw, true) ?? []) : [];
        if (!empty($body['_csrf'])) {
            return trim($body['_csrf']);
        }

        // From POST field
        if (!empty($_POST['_csrf'])) {
            return trim($_POST['_csrf']);
        }

        return null;
    }

    /**
     * Require a valid CSRF token; terminate with 403 if invalid.
     */
    public static function requireValid() {
        if (!self::validateToken(self::fromRequest())) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'msg' => 'CSRF token invalid or missing'], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }
}
