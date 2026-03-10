<?php
// ─────────────────────────────────────────────────────────────
// models/Payment.php — Payment model
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../config/constants.php';

class Payment {
    /**
     * Return all payments (admin) or just a user's own payments.
     */
    public static function findAll(mysqli $db, ?int $userId = null): array {
        if ($userId === null) {
            $stmt = $db->prepare(
                "SELECT p.*, o.status AS order_status, u.name AS user_name, u.email
                 FROM payments p
                 JOIN orders o ON p.order_id = o.id
                 JOIN users  u ON p.user_id  = u.id
                 ORDER BY p.created_at DESC"
            );
        } else {
            $stmt = $db->prepare(
                "SELECT p.*, o.status AS order_status
                 FROM payments p
                 JOIN orders o ON p.order_id = o.id
                 WHERE p.user_id = ?
                 ORDER BY p.created_at DESC"
            );
            $stmt->bind_param('i', $userId);
        }
        if (!$stmt) return [];
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $rows;
    }

    /**
     * Check whether a payment record already exists for an order.
     */
    public static function existsForOrder(mysqli $db, int $orderId): bool {
        $stmt = $db->prepare("SELECT id FROM payments WHERE order_id = ? LIMIT 1");
        if (!$stmt) return false;
        $stmt->bind_param('i', $orderId);
        $stmt->execute();
        $found = $stmt->get_result()->num_rows > 0;
        $stmt->close();
        return $found;
    }

    /**
     * Create a payment record. Returns new ID or 0.
     */
    public static function create(
        mysqli  $db,
        int     $orderId,
        int     $userId,
        float   $amount,
        string  $method,
        ?string $scheduledDate,
        string  $reference,
        string  $notes
    ): int {
        $stmt = $db->prepare(
            "INSERT INTO payments (order_id, user_id, amount, method, scheduled_date, reference, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        if (!$stmt) return 0;
        $stmt->bind_param('iidssss', $orderId, $userId, $amount, $method, $scheduledDate, $reference, $notes);
        $stmt->execute();
        $newId = $db->insert_id;
        $stmt->close();
        return $newId;
    }

    /**
     * Update payment status, reference and notes.
     */
    public static function updateStatus(
        mysqli $db,
        int    $id,
        string $status,
        string $reference = '',
        string $notes     = ''
    ): bool {
        if (!in_array($status, PAYMENT_STATUSES, true)) return false;
        $stmt = $db->prepare(
            "UPDATE payments SET status = ?, reference = ?, notes = ? WHERE id = ?"
        );
        if (!$stmt) return false;
        $stmt->bind_param('sssi', $status, $reference, $notes, $id);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    /**
     * Create a default COD payment record (used when creating an order).
     */
    public static function createCOD(mysqli $db, int $orderId, int $userId, float $amount): int {
        $stmt = $db->prepare(
            "INSERT IGNORE INTO payments (order_id, user_id, amount, method, status)
             VALUES (?, ?, ?, 'cod', 'pending')"
        );
        if (!$stmt) return 0;
        $stmt->bind_param('iid', $orderId, $userId, $amount);
        $stmt->execute();
        $newId = $db->insert_id;
        $stmt->close();
        return $newId;
    }

    /**
     * Confirm order when payment is marked as paid.
     */
    public static function confirmOrderOnPaid(mysqli $db, int $paymentId): void {
        $stmt = $db->prepare(
            "UPDATE orders SET status = 'confirmed'
             WHERE id = (SELECT order_id FROM payments WHERE id = ?)
               AND status = 'pending'"
        );
        if (!$stmt) return;
        $stmt->bind_param('i', $paymentId);
        $stmt->execute();
        $stmt->close();
    }
}
