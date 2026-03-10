<?php
// ─────────────────────────────────────────────────────────────
// index.php — TORO storefront entry point
//
// This file exists solely to set HTTP security headers that cannot
// be set via .htaccess on InfinityFree/LiteSpeed (mod_headers is
// unavailable on shared hosting).  After setting headers it serves
// the static index.html without modification.
// ─────────────────────────────────────────────────────────────

// ── 1. Strict-Transport-Security (HSTS) ──────────────────────
// Only send HSTS over HTTPS — never over plain HTTP.
$isHttps = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
if ($isHttps) {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains');
}

// ── 2. Clickjacking protection ────────────────────────────────
header('X-Frame-Options: SAMEORIGIN');

// ── 3. MIME-type sniffing protection ─────────────────────────
header('X-Content-Type-Options: nosniff');

// ── 4. Referrer Policy ───────────────────────────────────────
header('Referrer-Policy: strict-origin-when-cross-origin');

// ── 5. Content Security Policy ───────────────────────────────
// Resources loaded by index.html:
//   Scripts : 'self' (i18n.js, main.js, sw-register.js)
//   Styles  : 'self' (main.css) + Google Fonts stylesheet
//   Fonts   : Google Fonts CDN (gstatic)
//   Images  : 'self' + any HTTPS URL (product photos set by admin)
//             + data: (inline SVG/base64 fallbacks)
//   Connect : 'self' (API calls to /api/*)
//   Worker  : 'self' (sw.js service worker)
//   Manifest: 'self' (manifest.json)
//   Frames  : none — this page does not embed frames
header(
    "Content-Security-Policy: default-src 'none'; " .
    "script-src 'self'; " .
    "style-src 'self' https://fonts.googleapis.com; " .
    "font-src https://fonts.gstatic.com; " .
    "img-src 'self' https: data:; " .
    "connect-src 'self'; " .
    "manifest-src 'self'; " .
    "worker-src 'self'; " .
    "frame-ancestors 'none'; " .
    "base-uri 'self';"
);

// ── Serve the HTML shell ──────────────────────────────────────
header('Content-Type: text/html; charset=utf-8');
readfile(__DIR__ . '/index.html');
