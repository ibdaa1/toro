<?php
// ─────────────────────────────────────────────────────────────
// jwt.php — Token generation and verification helpers
// Uses base64url-encoded JSON payload (lightweight, no library).
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../config/config.php';

/**
 * Create a signed token for the given user ID.
 */
function makeToken(int $userId): string {
    $payload = json_encode(['id' => $userId, 'ts' => time()]);
    return rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');
}

/**
 * Decode a token and return the payload array, or null on failure.
 */
function decodeToken(string $token): ?array {
    $b64 = strtr(trim($token), '-_', '+/');
    $pad = strlen($b64) % 4;
    if ($pad) $b64 .= str_repeat('=', 4 - $pad);
    $raw = base64_decode($b64, true);
    if ($raw === false) return null;
    $data = json_decode($raw, true);
    if (!is_array($data) || empty($data['id']) || !isset($data['ts'])) return null;
    return $data;
}

/**
 * Extract a bearer token from the request in priority order:
 *   1. X-Token header (passed via .htaccess rewrite)
 *   2. Authorization: Bearer … header
 *   3. getallheaders() / apache_request_headers()
 *   4. JSON body { "_token": "…" }
 *   5. Query string ?_token=…
 */
function getToken(): ?string {
    // 1. X-Token custom header (via .htaccess)
    if (!empty($_SERVER['HTTP_X_TOKEN'])) {
        return trim($_SERVER['HTTP_X_TOKEN']);
    }

    // 2. Authorization header (various server variables)
    foreach (['HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION', 'HTTP_X_AUTHORIZATION'] as $k) {
        if (!empty($_SERVER[$k])) {
            $v = $_SERVER[$k];
            if (preg_match('/Bearer\s+(\S+)/i', $v, $m)) return $m[1];
            if (strlen(trim($v)) > 10) return trim($v);
        }
    }

    // 3. getallheaders() / apache_request_headers()
    foreach (['getallheaders', 'apache_request_headers'] as $fn) {
        if (function_exists($fn)) {
            $hdrs = array_change_key_case($fn(), CASE_LOWER);
            if (!empty($hdrs['x-token'])) return trim($hdrs['x-token']);
            if (!empty($hdrs['authorization'])) {
                $v = $hdrs['authorization'];
                if (preg_match('/Bearer\s+(\S+)/i', $v, $m)) return $m[1];
                if (strlen(trim($v)) > 10) return trim($v);
            }
        }
    }

    // 4. JSON body _token (most reliable fallback on InfinityFree)
    $rawBody = file_get_contents('php://input');
    if ($rawBody) {
        $body = json_decode($rawBody, true);
        if (!empty($body['_token'])) return trim($body['_token']);
    }

    // 5. Query string ?_token=… (for GET / DELETE)
    if (!empty($_GET['_token'])) return trim($_GET['_token']);

    return null;
}
