<?php
// ─────────────────────────────────────────────────────────────
// auth_helper.php — Authentication helper
// Validates the request token and returns the user array.
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/jwt.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/config.php';

/**
 * Authenticate the current request.
 *
 * @param bool $requireAdmin  If true, the user must have the 'admin' role.
 * @return array              The authenticated user record.
 */
function authUser(bool $requireAdmin = false): array {
    $token = getToken();
    if (!$token) {
        err('Unauthorized - token not found in headers/body/query', 401);
    }

    $data = decodeToken($token);
    if (!$data) {
        err('Invalid token format', 401);
    }

    if ((time() - (int)$data['ts']) > TOKEN_EXPIRY) {
        err('Session expired - please login again', 401);
    }

    $userId = (int)$data['id'];
    if ($userId <= 0) {
        err('Invalid user id in token', 401);
    }

    $db   = getDB();
    $stmt = $db->prepare(
        "SELECT id, name, email, role, is_active FROM users WHERE id = ? LIMIT 1"
    );
    if (!$stmt) {
        $db->close();
        err('DB prepare error: ' . $db->error, 500);
    }
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $db->close();

    if (!$user) {
        err('User not found', 401);
    }
    if (isset($user['is_active']) && (int)$user['is_active'] === 0) {
        err('Account deactivated', 403);
    }
    if ($requireAdmin && $user['role'] !== ROLE_ADMIN) {
        err('Admin only - requires admin role', 403);
    }

    return $user;
}
