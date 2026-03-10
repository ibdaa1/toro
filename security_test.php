<?php
// ─────────────────────────────────────────────────────────────
// security_test.php — Live security diagnostic
// Place at the site root. Delete or restrict access after use.
// ─────────────────────────────────────────────────────────────

// ── 1. Set security headers for THIS response first ──────────
// These must be set before any output and before headers_list()
// is called, so the checks below will confirm they work on this
// server.  The same headers are also set by api/config/cors.php
// for every API response.
header('X-Frame-Options: SAMEORIGIN');
header('X-Content-Type-Options: nosniff');
header('X-XSS-Protection: 1; mode=block');
header("Content-Security-Policy: default-src 'none'");

// ── 2. Set plain-text content type for readable output ───────
header('Content-Type: text/plain; charset=utf-8');

echo "=== SECURITY TEST ===\n\n";

// ── Check 1: HTTPS ───────────────────────────────────────────
if (!isset($_SERVER['HTTPS']) || $_SERVER['HTTPS'] !== 'on') {
    echo "\xE2\x9D\x8C HTTPS NOT ENABLED\n";
} else {
    echo "\xE2\x9C\x85 HTTPS ENABLED\n";
}

// ── Check 2: Security headers ────────────────────────────────
$responseHeaders = headers_list();

$required = array(
    'X-Frame-Options',
    'X-Content-Type-Options',
    'X-XSS-Protection',
    'Content-Security-Policy',
);

foreach ($required as $needed) {
    $found = false;
    foreach ($responseHeaders as $h) {
        if (stripos($h, $needed) !== false) {
            $found = true;
            break;
        }
    }
    echo ($found ? "\xE2\x9C\x85" : "\xE2\x9D\x8C") . " $needed\n";
}

// ── Check 3: Dangerous PHP functions ─────────────────────────
$danger = array('exec', 'shell_exec', 'system', 'passthru');

foreach ($danger as $func) {
    if (function_exists($func)) {
        echo "\xE2\x9A\xA0\xEF\xB8\x8F $func enabled\n";
    } else {
        echo "\xE2\x9C\x85 $func disabled\n";
    }
}

// ── Check 4: Password hashing ────────────────────────────────
$password = 'T3st!P@ss#2024';
$hash     = password_hash($password, PASSWORD_BCRYPT);

if (password_verify($password, $hash)) {
    echo "\xE2\x9C\x85 PASSWORD HASH OK\n";
} else {
    echo "\xE2\x9D\x8C PASSWORD HASH ERROR\n";
}

// ── Check 5: Cryptographically secure random bytes ───────────
try {
    $token = bin2hex(random_bytes(16));
    echo "\xE2\x9C\x85 SECURE RANDOM OK\n";
} catch (Exception $e) {
    echo "\xE2\x9D\x8C RANDOM ERROR: " . $e->getMessage() . "\n";
}

// ── Check 6: Error display ───────────────────────────────────
if (ini_get('display_errors')) {
    echo "\xE2\x9D\x8C display_errors ON\n";
} else {
    echo "\xE2\x9C\x85 display_errors OFF\n";
}

echo "\n=== TEST COMPLETE ===\n";
