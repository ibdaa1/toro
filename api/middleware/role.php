<?php
// ─────────────────────────────────────────────────────────────
// middleware/role.php — Role-based access middleware
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../helpers/RBAC.php';
require_once __DIR__ . '/../helpers/response.php';

class RoleMiddleware {
    /**
     * Require that the authenticated user has the given permission.
     *
     * @param array  $user
     * @param string $permission
     */
    public static function require(array $user, string $permission): void {
        RBAC::require($user, $permission);
    }

    /**
     * Require that the authenticated user has the 'admin' role.
     *
     * @param array $user
     */
    public static function requireAdmin(array $user): void {
        if (($user['role'] ?? '') !== 'admin') {
            err('Admin access required', 403);
        }
    }

    /**
     * Return true if the user is an admin.
     */
    public static function isAdmin(array $user): bool {
        return ($user['role'] ?? '') === 'admin';
    }
}
