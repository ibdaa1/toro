<?php
declare(strict_types=1);

// ─────────────────────────────────────────────
// security.php — Production Security Utilities
// ─────────────────────────────────────────────

/**
 * Clean string input
 */
function sanitizeString(?string $str, int $maxLen = 255): string
{
    if ($str === null) {
        return '';
    }

    $str = trim($str);
    $str = strip_tags($str);
    $str = preg_replace('/[\x00-\x1F\x7F]/u', '', $str);

    if (mb_strlen($str) > $maxLen) {
        $str = mb_substr($str, 0, $maxLen);
    }

    return $str;
}

/**
 * Escape output for HTML
 */
function escHtml(?string $str): string
{
    if ($str === null) {
        return '';
    }

    return htmlspecialchars(
        $str,
        ENT_QUOTES | ENT_SUBSTITUTE | ENT_HTML5,
        'UTF-8'
    );
}

/**
 * Validate integer
 */
function sanitizeInt($value): int
{
    $int = filter_var($value, FILTER_VALIDATE_INT);
    return $int === false ? 0 : $int;
}

/**
 * Validate float
 */
function sanitizeFloat($value): float
{
    $float = filter_var($value, FILTER_VALIDATE_FLOAT);
    return $float === false ? 0.0 : $float;
}

/**
 * Validate email
 */
function isValidEmail(string $email): bool
{
    if (strlen($email) > 254) {
        return false;
    }

    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Normalize email
 */
function normalizeEmail(string $email): string
{
    return strtolower(trim($email));
}

/**
 * Validate image URL
 */
function isValidImageUrl(string $url): bool
{
    if (strlen($url) > 500) {
        return false;
    }

    if (!filter_var($url, FILTER_VALIDATE_URL)) {
        return false;
    }

    return preg_match('#^https?://#i', $url) === 1;
}

/**
 * Generate secure random token
 */
function generateToken(int $bytes = 32): string
{
    return bin2hex(random_bytes($bytes));
}

/**
 * Hash password (bcrypt)
 */
function hashPassword(string $password): string
{
    $options = [
        'cost' => defined('BCRYPT_COST') ? BCRYPT_COST : 12
    ];

    return password_hash($password, PASSWORD_BCRYPT, $options);
}

/**
 * Verify password
 */
function verifyPassword(string $password, string $hash): bool
{
    return password_verify($password, $hash);
}

/**
 * Check allowed values
 */
function inAllowed($value, array $allowed): bool
{
    return in_array($value, $allowed, true);
}

/**
 * Secure compare tokens
 */
function secureCompare(string $a, string $b): bool
{
    return hash_equals($a, $b);
}

/**
 * Validate string length
 */
function validateLength(string $str, int $min = 0, int $max = 255): bool
{
    $len = mb_strlen($str);
    return $len >= $min && $len <= $max;
}

/**
 * Validate username
 */
function isValidUsername(string $username): bool
{
    return preg_match('/^[a-zA-Z0-9_\-]{3,50}$/', $username) === 1;
}

/**
 * Validate phone (basic international)
 */
function isValidPhone(string $phone): bool
{
    return preg_match('/^\+?[0-9]{7,20}$/', $phone) === 1;
}