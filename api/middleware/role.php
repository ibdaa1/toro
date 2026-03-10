<?php
// ─────────────────────────────────────────────────────────────
// middleware/role.php — Role-based access middleware
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../helpers/RBAC.php';
require_once __DIR__ . '/../helpers/response.php';

class RoleMiddleware {
    /**
     * Require that the authenticated user has the given permission.
     */
    public static function require($user, $permission) {
        RBAC::require($user, $permission);
    }

    /**
     * Require that the authenticated user has the 'admin' role.
     */
    public static function requireAdmin($user) {
        if ((isset($user['role']) ? $user['role'] : '') !== 'admin') {
            err('Admin access required', 403);
        }
    }

    /**
     * Return true if the user is an admin.
     */
    public static function isAdmin($user) {
        return (isset($user['role']) ? $user['role'] : '') === 'admin';
    }
}
