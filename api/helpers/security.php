<?php
// ─────────────────────────────────────────────────────────────
// security.php — Input sanitization and security utilities
// ─────────────────────────────────────────────────────────────

/**
 * Sanitize a string: trim + strip HTML tags.
 */
function sanitize(string $str, int $maxLen = 0): string {
    $clean = trim(strip_tags($str));
    if ($maxLen > 0 && mb_strlen($clean) > $maxLen) {
        $clean = mb_substr($clean, 0, $maxLen);
    }
    return $clean;
}

/**
 * Escape HTML special characters for safe output in HTML contexts.
 */
function escHtml(?string $str): string {
    if ($str === null) return '';
    return htmlspecialchars($str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Validate that a value is one of the allowed values.
 */
function inAllowed($value, array $allowed): bool {
    return in_array($value, $allowed, true);
}

/**
 * Generate a cryptographically secure random hex string.
 *
 * @param int $bytes Number of random bytes (output length = $bytes * 2).
 */
function randomHex(int $bytes = 16): string {
    return bin2hex(random_bytes($bytes));
}

/**
 * Hash a password with bcrypt.
 */
function hashPassword(string $password): string {
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => defined('BCRYPT_COST') ? BCRYPT_COST : 11]);
}

/**
 * Verify a plain-text password against a bcrypt hash.
 */
function verifyPassword(string $password, string $hash): bool {
    return password_verify($password, $hash);
}

/**
 * Validate an email address.
 */
function isValidEmail(string $email): bool {
    return (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Validate a URL (http/https only, max 500 chars).
 */
function isValidImageUrl(string $url): bool {
    return preg_match('#^https?://#i', $url) && strlen($url) <= 500;
}
