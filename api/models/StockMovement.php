<?php
// ─────────────────────────────────────────────────────────────
// models/StockMovement.php — Stock movement model
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../config/constants.php';

class StockMovement {
    /**
     * Auto-create the stock_movements table if it doesn't exist.
     */
    public static function ensureTable($db) {
        $result = $db->query("CREATE TABLE IF NOT EXISTS `stock_movements` (
            `id`         INT AUTO_INCREMENT PRIMARY KEY,
            `product_id` INT NOT NULL,
            `type`       ENUM('in','out','adjustment') DEFAULT 'in',
            `quantity`   INT NOT NULL,
            `balance`    INT NOT NULL COMMENT 'stock level after movement',
            `reason`     VARCHAR(255) DEFAULT '',
            `user_id`    INT DEFAULT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`user_id`)    REFERENCES `users`(`id`)    ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
        return $result !== false;
    }

    /**
     * Return movements, optionally filtered by product ID.
     * Pass null for productId to get all movements.
     */
    public static function findAll($db, $productId = null, $limit = 50, $offset = 0) {
        if ($productId !== null) {
            $stmt = $db->prepare(
                "SELECT sm.*, p.name_ar, p.name_en, p.brand, u.name AS admin_name
                 FROM stock_movements sm
                 JOIN products p ON sm.product_id = p.id
                 LEFT JOIN users u ON sm.user_id = u.id
                 WHERE sm.product_id = ?
                 ORDER BY sm.created_at DESC LIMIT 100"
            );
            if (!$stmt) return [];
            $stmt->bind_param('i', $productId);
        } else {
            $stmt = $db->prepare(
                "SELECT sm.*, p.name_ar, p.name_en, p.brand, u.name AS admin_name
                 FROM stock_movements sm
                 JOIN products p ON sm.product_id = p.id
                 LEFT JOIN users u ON sm.user_id = u.id
                 ORDER BY sm.created_at DESC LIMIT ? OFFSET ?"
            );
            if (!$stmt) return [];
            $stmt->bind_param('ii', $limit, $offset);
        }

        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $rows;
    }

    /**
     * Record a stock movement and return its new ID.
     */
    public static function record($db, $productId, $type, $quantity, $balance, $reason, $userId) {
        $stmt = $db->prepare(
            "INSERT INTO stock_movements (product_id, type, quantity, balance, reason, user_id)
             VALUES (?, ?, ?, ?, ?, ?)"
        );
        if (!$stmt) return 0;
        $stmt->bind_param('isiisi', $productId, $type, $quantity, $balance, $reason, $userId);
        $stmt->execute();
        $newId = $db->insert_id;
        $stmt->close();
        return (int)$newId;
    }
}
