<?php
// ─────────────────────────────────────────────────────────────
// manifest.php — PWA Web App Manifest
//
// Serves manifest.json with the explicit application/manifest+json
// Content-Type header.  On InfinityFree/LiteSpeed the static
// manifest.json is sometimes returned as HTML (the server routes
// unknown requests through the PHP index), so this PHP wrapper
// guarantees the browser always receives valid JSON with the
// correct MIME type.
// ─────────────────────────────────────────────────────────────

header('Content-Type: application/manifest+json; charset=utf-8');
header('Cache-Control: public, max-age=86400');
readfile(__DIR__ . '/manifest.json');
