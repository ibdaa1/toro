<?php
// ─────────────────────────────────────────────────────────────
// middleware/auth.php — Authentication middleware
// Wraps authUser() for use as an OOP middleware.
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../helpers/auth_helper.php';

class AuthMiddleware {
    /**
     * Require a valid token; returns the authenticated user.
     *
     * @param bool $requireAdmin  Require admin role if true.
     * @return array
     */
    public static function handle(bool $requireAdmin = false): array {
        return authUser($requireAdmin);
    }

    /**
     * Require an authenticated user (any role).
     */
    public static function user(): array {
        return self::handle(false);
    }

    /**
     * Require an admin user.
     */
    public static function admin(): array {
        return self::handle(true);
    }
}
