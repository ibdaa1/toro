<?php
// ─────────────────────────────────────────────────────────────
// response.php — JSON response helpers
// ─────────────────────────────────────────────────────────────

/**
 * Send a successful JSON response and terminate.
 */
function ok(array $data = []): void {
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Send an error JSON response with the given HTTP status code and terminate.
 */
function err(string $msg, int $code = 400): void {
    http_response_code($code);
    echo json_encode(['ok' => false, 'msg' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}
