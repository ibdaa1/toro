<?php
// ─────────────────────────────────────────────────────────────
// middleware/rate_limit.php — File-based rate limiting
// Suitable for shared hosting environments without Redis.
// ─────────────────────────────────────────────────────────────

class RateLimitMiddleware {
    /**
     * Check whether the current IP has exceeded the rate limit.
     *
     * @param int    $maxRequests  Maximum requests allowed per window.
     * @param int    $windowSecs   Time window in seconds.
     * @param string $action       Identifier for the rate-limited action.
     */
    public static function check(int $maxRequests = 60, int $windowSecs = 60, string $action = 'default'): void {
        $ip      = self::getClientIp();
        $key     = preg_replace('/[^a-z0-9._-]/i', '_', $action . '_' . $ip);
        $tmpDir  = sys_get_temp_dir();
        $file    = $tmpDir . '/toro_rl_' . md5($key) . '.json';

        $now  = time();
        $data = ['count' => 0, 'window_start' => $now];

        if (file_exists($file)) {
            $raw = @file_get_contents($file);
            if ($raw) {
                $saved = json_decode($raw, true);
                if (is_array($saved) && ($now - ($saved['window_start'] ?? 0)) < $windowSecs) {
                    $data = $saved;
                }
            }
        }

        $data['count']++;

        if ($data['count'] > $maxRequests) {
            http_response_code(429);
            header('Retry-After: ' . ($windowSecs - ($now - $data['window_start'])));
            echo json_encode([
                'ok'  => false,
                'msg' => 'Too many requests. Please slow down.',
            ], JSON_UNESCAPED_UNICODE);
            exit;
        }

        @file_put_contents($file, json_encode($data), LOCK_EX);
    }

    /**
     * Get the real client IP, accounting for proxies.
     */
    private static function getClientIp(): string {
        $keys = [
            'HTTP_CF_CONNECTING_IP',  // Cloudflare
            'HTTP_X_FORWARDED_FOR',
            'HTTP_X_REAL_IP',
            'REMOTE_ADDR',
        ];
        foreach ($keys as $k) {
            if (!empty($_SERVER[$k])) {
                $ip = trim(explode(',', $_SERVER[$k])[0]);
                if (filter_var($ip, FILTER_VALIDATE_IP)) {
                    return $ip;
                }
            }
        }
        return '0.0.0.0';
    }
}
