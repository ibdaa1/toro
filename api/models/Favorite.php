<?php
// ─────────────────────────────────────────────────────────────
// models/Favorite.php — Favorite (wishlist) model
// ─────────────────────────────────────────────────────────────

class Favorite {
    /**
     * Return all favorites for a user, including product details.
     */
    public static function findByUser($db, $userId) {
        $stmt = $db->prepare(
            "SELECT f.id AS fav_id, f.created_at AS added_at,
                    p.id, p.name_ar, p.name_en, p.brand, p.origin,
                    p.category, p.price, p.price_before, p.stock,
                    p.image, p.is_active, p.description_ar, p.description_en
             FROM favorites f
             JOIN products  p ON f.product_id = p.id
             WHERE f.user_id = ?
             ORDER BY f.created_at DESC"
        );
        if (!$stmt) return [];
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $rows;
    }

    /**
     * Check whether a product is already in a user's favorites.
     */
    public static function exists($db, $userId, $productId) {
        $stmt = $db->prepare(
            "SELECT id FROM favorites WHERE user_id = ? AND product_id = ? LIMIT 1"
        );
        if (!$stmt) return false;
        $stmt->bind_param('ii', $userId, $productId);
        $stmt->execute();
        $found = $stmt->get_result()->num_rows > 0;
        $stmt->close();
        return $found;
    }

    /**
     * Add a product to favorites.
     */
    public static function add($db, $userId, $productId) {
        $stmt = $db->prepare("INSERT INTO favorites (user_id, product_id) VALUES (?, ?)");
        if (!$stmt) return false;
        $stmt->bind_param('ii', $userId, $productId);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    /**
     * Remove a product from favorites by user + product.
     */
    public static function remove($db, $userId, $productId) {
        $stmt = $db->prepare("DELETE FROM favorites WHERE user_id = ? AND product_id = ?");
        if (!$stmt) return false;
        $stmt->bind_param('ii', $userId, $productId);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }
}