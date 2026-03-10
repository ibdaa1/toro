<?php
// ─────────────────────────────────────────────────────────────
// models/Order.php — Order model
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../config/constants.php';

class Order {
    /**
     * Return all orders. Pass null for admin (all), or user ID for own orders.
     */
    public static function findAll($db, $userId = null) {
        if ($userId === null) {
            $stmt = $db->prepare(
                "SELECT o.*, u.name AS user_name, u.email
                 FROM orders o JOIN users u ON o.user_id = u.id
                 ORDER BY o.created_at DESC"
            );
        } else {
            $stmt = $db->prepare(
                "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC"
            );
            $stmt->bind_param('i', $userId);
        }
        if (!$stmt) return [];
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();

        // Attach items to each order
        foreach ($rows as &$order) {
            $order['items'] = self::getItems($db, (int)$order['id']);
        }
        unset($order);

        return $rows;
    }

    /**
     * Get items for a single order.
     */
    public static function getItems($db, $orderId) {
        $stmt = $db->prepare(
            "SELECT oi.*, p.name_ar, p.name_en, p.image
             FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             WHERE oi.order_id = ?"
        );
        if (!$stmt) return [];
        $stmt->bind_param('i', $orderId);
        $stmt->execute();
        $items = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $items;
    }

    /**
     * Create a new order and return its ID.
     */
    public static function create($db, $userId, $total, $address, $notes) {
        $stmt = $db->prepare(
            "INSERT INTO orders (user_id, total, address, notes) VALUES (?, ?, ?, ?)"
        );
        if (!$stmt) return 0;
        $stmt->bind_param('idss', $userId, $total, $address, $notes);
        $stmt->execute();
        $newId = $db->insert_id;
        $stmt->close();
        return (int)$newId;
    }

    /**
     * Insert a single order item.
     */
    public static function addItem($db, $orderId, $productId, $qty, $price) {
        $stmt = $db->prepare(
            "INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)"
        );
        if (!$stmt) return false;
        $stmt->bind_param('iiid', $orderId, $productId, $qty, $price);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    /**
     * Update an order's status.
     */
    public static function updateStatus($db, $id, $status) {
        if (!in_array($status, ORDER_STATUSES, true)) return false;
        $stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
        if (!$stmt) return false;
        $stmt->bind_param('si', $status, $id);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    /**
     * Fetch a single order by ID (with items). Returns array or null.
     */
    public static function findById($db, $id) {
        $stmt = $db->prepare(
            "SELECT o.*, u.name AS user_name, u.email
             FROM orders o JOIN users u ON o.user_id = u.id
             WHERE o.id = ? LIMIT 1"
        );
        if (!$stmt) return null;
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $order = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$order) return null;
        $order['items'] = self::getItems($db, $id);
        return $order;
    }
}
