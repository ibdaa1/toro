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
    private const PERMISSIONS = [
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
     *
     * @param array  $user       Authenticated user array (must contain 'role').
     * @param string $permission Permission string, e.g. "products:read".
     */
    public static function can(array $user, string $permission): bool {
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
     *
     * @param array  $user
     * @param string $permission
     */
    public static function require(array $user, string $permission): void {
        if (!self::can($user, $permission)) {
            http_response_code(403);
            echo json_encode(['ok' => false, 'msg' => 'Forbidden: ' . $permission], JSON_UNESCAPED_UNICODE);
            exit;
        }
    }

    /**
     * Return all permissions for a role.
     */
    public static function getPermissions(string $role): array {
        return self::PERMISSIONS[$role] ?? [];
    }
}
