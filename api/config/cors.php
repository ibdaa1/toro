<?php
// ─────────────────────────────────────────────────────────────
// cors.php — CORS and security response headers
// Handles all cross-origin preflight and response headers.
// NOTE: InfinityFree/LiteSpeed does NOT support mod_headers, so
// every header MUST be set here via PHP header() calls.
// ─────────────────────────────────────────────────────────────

// ── CORS headers ─────────────────────────────────────────────
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-Token');
header('Content-Type: application/json; charset=utf-8');

// ── Security headers ─────────────────────────────────────────
// Prevent clickjacking
header('X-Frame-Options: SAMEORIGIN');
// Prevent MIME-type sniffing
header('X-Content-Type-Options: nosniff');
// Legacy XSS filter (IE/old Chrome)
header('X-XSS-Protection: 1; mode=block');
// Restrict resource loading — this endpoint only returns JSON so no
// external resources (scripts, styles, images) need to be loaded.
header("Content-Security-Policy: default-src 'none'");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
