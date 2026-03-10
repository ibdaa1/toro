<?php
// ─────────────────────────────────────────────────────────────
// models/User.php — User model
// ─────────────────────────────────────────────────────────────

class User {
    /**
     * Find a user by primary key.
     */
    public static function findById(mysqli $db, int $id): ?array {
        $stmt = $db->prepare(
            "SELECT id, name, email, role, is_active, created_at FROM users WHERE id = ? LIMIT 1"
        );
        if (!$stmt) return null;
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $row ?: null;
    }

    /**
     * Find a user by email address.
     */
    public static function findByEmail(mysqli $db, string $email): ?array {
        $stmt = $db->prepare(
            "SELECT id, name, email, password, role, is_active FROM users WHERE email = ? LIMIT 1"
        );
        if (!$stmt) return null;
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $row ?: null;
    }

    /**
     * Check whether an email address is already registered.
     */
    public static function emailExists(mysqli $db, string $email): bool {
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
        if (!$stmt) return false;
        $stmt->bind_param('s', $email);
        $stmt->execute();
        $exists = $stmt->get_result()->num_rows > 0;
        $stmt->close();
        return $exists;
    }

    /**
     * Create a new customer account and return the new user ID.
     */
    public static function create(mysqli $db, string $name, string $email, string $passwordHash): int {
        $stmt = $db->prepare(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')"
        );
        if (!$stmt) return 0;
        $stmt->bind_param('sss', $name, $email, $passwordHash);
        $stmt->execute();
        $newId = $db->insert_id;
        $stmt->close();
        return $newId;
    }

    /**
     * Return all users ordered by registration date.
     */
    public static function findAll(mysqli $db): array {
        $result = $db->query(
            "SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC"
        );
        return $result ? $result->fetch_all(MYSQLI_ASSOC) : [];
    }

    /**
     * Update a user's is_active flag.
     */
    public static function setActive(mysqli $db, int $id, int $isActive): bool {
        $stmt = $db->prepare("UPDATE users SET is_active = ? WHERE id = ?");
        if (!$stmt) return false;
        $stmt->bind_param('ii', $isActive, $id);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    /**
     * Count active admins excluding a given user ID.
     */
    public static function countActiveAdminsExcluding(mysqli $db, int $excludeId): int {
        $stmt = $db->prepare(
            "SELECT COUNT(*) c FROM users WHERE role='admin' AND is_active=1 AND id != ?"
        );
        if (!$stmt) return 0;
        $stmt->bind_param('i', $excludeId);
        $stmt->execute();
        $count = (int)$stmt->get_result()->fetch_assoc()['c'];
        $stmt->close();
        return $count;
    }
}
