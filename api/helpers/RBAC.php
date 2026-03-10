<?php
// ─────────────────────────────────────────────────────────────
// RBAC.php — Role-Based Access Control
// ─────────────────────────────────────────────────────────────

class RBAC {
    /**
     * Permission matrix.
     * Admins have all permissions (*).
     * Customers have a limited explicit set.
     */
    // Note: no visibility modifier on const — compatible with PHP 7.0
    const PERMISSIONS = [
        'admin'    => ['*'],
        'customer' => [
            'products:read',
            'orders:create',
            'orders:read_own',
            'payments:read_own',
            'payments:create',
            'favorites:read',
            'favorites:write',
            'users:read_own',
        ],
    ];

    /**
     * Check whether a user has a given permission.
     */
    public static function can($user, $permission) {
        $role  = $user['role'] ?? 'customer';
        $perms = self::PERMISSIONS[$role] ?? [];

        // Wildcard — admin can do everything
        if (in_array('*', $perms, true)) {
            return true;
        }

        return in_array($permission, $perms, true);
    }

    /**
     * Require a permission; terminate with 403 if not granted.
     */
    public static function require($user, $permission) {
        if (!self::can($user, $permission)) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'msg' => 'Forbidden: ' . $permission], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    /**
     * Return all permissions for a role.
     */
    public static function getPermissions($role) {
        return self::PERMISSIONS[$role] ?? [];
    }
}
