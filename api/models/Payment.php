<?php
// ─────────────────────────────────────────────────────────────
// models/Payment.php — Payment model
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../config/constants.php';

class Payment {
    /**
     * Return all payments. Pass null for admin (all), or user ID for own.
     */
    public static function findAll($db, $userId = null) {
        if ($userId === null) {
            $stmt = $db->prepare(
                "SELECT p.*, o.status AS order_status, u.name AS user_name, u.email
                 FROM payments p
                 JOIN orders o ON p.order_id = o.id
                 JOIN users  u ON p.user_id  = u.id
                 ORDER BY p.created_at DESC"
            );
            if (!$stmt) return [];
        } else {
            $stmt = $db->prepare(
                "SELECT p.*, o.status AS order_status
                 FROM payments p
                 JOIN orders o ON p.order_id = o.id
                 WHERE p.user_id = ?
                 ORDER BY p.created_at DESC"
            );
            if (!$stmt) return [];
            $stmt->bind_param('i', $userId);
        }

        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $rows;
    }

    /**
     * Check whether a payment record already exists for an order.
     */
    public static function existsForOrder($db, $orderId) {
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
     * $scheduledDate can be a string date or null.
     */
    public static function create($db, $orderId, $userId, $amount, $method, $scheduledDate, $reference, $notes) {
        $stmt = $db->prepare(
            "INSERT INTO payments (order_id, user_id, amount, method, scheduled_date, reference, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        if (!$stmt) return 0;
        $stmt->bind_param('iidssss', $orderId, $userId, $amount, $method, $scheduledDate, $reference, $notes);
        $stmt->execute();
        $newId = $db->insert_id;
        $stmt->close();
        return (int)$newId;
    }

    /**
     * Update payment status, reference and notes.
     */
    public static function updateStatus($db, $id, $status, $reference = '', $notes = '') {
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
     * Create a default COD payment record.
     */
    public static function createCOD($db, $orderId, $userId, $amount) {
        $stmt = $db->prepare(
            "INSERT IGNORE INTO payments (order_id, user_id, amount, method, status)
             VALUES (?, ?, ?, 'cod', 'pending')"
        );
        if (!$stmt) return 0;
        $stmt->bind_param('iid', $orderId, $userId, $amount);
        $stmt->execute();
        $newId = $db->insert_id;
        $stmt->close();
        return (int)$newId;
    }

    /**
     * Confirm order when payment is marked as paid.
     */
    public static function confirmOrderOnPaid($db, $paymentId) {
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
