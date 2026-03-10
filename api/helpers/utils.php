<?php
// ─────────────────────────────────────────────────────────────
// utils.php — General utility functions
// ─────────────────────────────────────────────────────────────

/**
 * Format a datetime string as YYYY-MM-DD.
 */
function fmtDate($s) {
    return $s ? substr((string)$s, 0, 10) : '—';
}

/**
 * Format a number with locale-aware separators.
 */
function fmtNum($n) {
    return number_format((float)($n ?? 0), 0, '.', ',');
}

/**
 * Parse the JSON request body once and cache it.
 */
function getBody() {
    static $body = null;
    if ($body === null) {
        $raw  = file_get_contents('php://input');
        $body = ($raw !== false && $raw !== '') ? (json_decode($raw, true) ?? []) : [];
    }
    return $body;
}

/**
 * Get an integer query string parameter with a fallback default.
 */
function qInt($key, $default = 0) {
    return isset($_GET[$key]) ? (int)$_GET[$key] : $default;
}

/**
 * Get a string query string parameter, trimmed, with a fallback default.
 */
function qStr($key, $default = '') {
    return isset($_GET[$key]) ? trim((string)$_GET[$key]) : $default;
}

/**
 * Clamp an integer between $min and $max.
 */
function clamp($val, $min, $max) {
    return max($min, min($max, $val));
}

/**
 * Return the current HTTP request method (uppercase).
 */
function reqMethod() {
    return strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
}
