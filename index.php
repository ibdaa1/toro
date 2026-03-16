<?php
// ─────────────────────────────────────────────────────────────
// index.php — TORO storefront entry point
//
// This file exists solely to set HTTP security headers that cannot
// be set via .htaccess on InfinityFree/LiteSpeed (mod_headers is
// unavailable on shared hosting).  After setting headers it serves
// the static index.html without modification.
// ─────────────────────────────────────────────────────────────

// ── 0. HTTP → HTTPS redirect ─────────────────────────────────
// InfinityFree's Openresty proxy terminates SSL and forwards requests
// to PHP as plain HTTP, setting X-Forwarded-Proto to signal the
// original protocol.  If neither indicator shows HTTPS, issue a 301
// redirect — this acts as a fallback for cases where the .htaccess
// RewriteEngine does not run (e.g., raw HTTP traffic bypassing LiteSpeed
// .htaccess processing on InfinityFree's free tier).
$isHttps = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');
if (!$isHttps) {
    // Ensure the URI starts with / so the target is always a path on
    // the same host, never a protocol-relative URL.  Use the canonical
    // hostname (hardcoded to prevent open-redirect via a crafted Host
    // header — the domain is already hardcoded site-wide in main.js and
    // manifest.json, so this is consistent with the project's convention).
    $rawUri = isset($_SERVER['REQUEST_URI']) ? $_SERVER['REQUEST_URI'] : '/';
    $uri    = '/' . ltrim($rawUri, '/');
    header('Location: https://toroboutique.top' . $uri, true, 301);
    exit;
}

// ── 1. Strict-Transport-Security (HSTS) ──────────────────────
// We only reach here over HTTPS (HTTP requests were redirected above).
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
//             + 'unsafe-inline' required for onclick/oninput handlers in
//             index.html and for inline event handlers in JS-generated HTML
//             (product cards, image onerror fallbacks, admin table rows).
//             script-src 'self' still blocks loading scripts from any
//             external origin, which is the primary XSS vector.
//   Styles  : 'self' (main.css) + Google Fonts stylesheet
//             + 'unsafe-inline' required for inline style= attributes in
//             JS-generated HTML (product cards, marquee, order tables, etc.)
//   Fonts   : Google Fonts CDN (gstatic)
//   Images  : 'self' + any HTTPS URL (product photos set by admin)
//             + data: (inline SVG/base64 fallbacks)
//   Connect : 'self' (API calls to /api/*)
//   Worker  : 'self' (sw.js service worker)
//   Manifest: 'self' (manifest.php)
//   Frames  : none — this page does not embed frames
header(
    "Content-Security-Policy: default-src 'none'; " .
    "script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; " .
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com; " .
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
