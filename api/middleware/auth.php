<?php
// ─────────────────────────────────────────────────────────────
// middleware/auth.php — Authentication middleware
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../helpers/auth_helper.php';

class AuthMiddleware {
    /**
     * Require a valid token; returns the authenticated user.
     */
    public static function handle($requireAdmin = false) {
        return authUser($requireAdmin);
    }

    /**
     * Require an authenticated user (any role).
     */
    public static function user() {
        return self::handle(false);
    }

    /**
     * Require an admin user.
     */
    public static function admin() {
        return self::handle(true);
    }
}
