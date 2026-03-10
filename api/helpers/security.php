<?php
// ─────────────────────────────────────────────────────────────
// security.php — Input sanitization and security utilities
// ─────────────────────────────────────────────────────────────

/**
 * Sanitize a string: trim + strip HTML tags.
 */
function sanitize($str, $maxLen = 0) {
    $clean = trim(strip_tags((string)$str));
    if ($maxLen > 0 && mb_strlen($clean) > $maxLen) {
        $clean = mb_substr($clean, 0, $maxLen);
    }
    return $clean;
}

/**
 * Escape HTML special characters for safe output in HTML contexts.
 */
function escHtml($str) {
    if ($str === null) return '';
    return htmlspecialchars((string)$str, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

/**
 * Validate that a value is one of the allowed values.
 */
function inAllowed($value, $allowed) {
    return in_array($value, $allowed, true);
}

/**
 * Generate a cryptographically secure random hex string.
 */
function randomHex($bytes = 16) {
    return bin2hex(random_bytes($bytes));
}

/**
 * Hash a password with bcrypt.
 */
function hashPassword($password) {
    $cost = defined('BCRYPT_COST') ? BCRYPT_COST : 11;
    return password_hash($password, PASSWORD_BCRYPT, ['cost' => $cost]);
}

/**
 * Verify a plain-text password against a bcrypt hash.
 */
function verifyPassword($password, $hash) {
    return password_verify($password, $hash);
}

/**
 * Validate an email address.
 */
function isValidEmail($email) {
    return (bool)filter_var($email, FILTER_VALIDATE_EMAIL);
}

/**
 * Validate a URL (http/https only, max 500 chars).
 */
function isValidImageUrl($url) {
    return preg_match('#^https?://#i', $url) && strlen($url) <= 500;
}
