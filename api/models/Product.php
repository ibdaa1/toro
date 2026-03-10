<?php
// ─────────────────────────────────────────────────────────────
// models/Product.php — Product model
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../config/constants.php';

class Product {
    /**
     * Find one active product by ID.
     */
    public static function findById(mysqli $db, int $id, bool $activeOnly = true): ?array {
        $sql = $activeOnly
            ? "SELECT * FROM products WHERE id = ? AND is_active = 1 LIMIT 1"
            : "SELECT * FROM products WHERE id = ? LIMIT 1";
        $stmt = $db->prepare($sql);
        if (!$stmt) return null;
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $row ?: null;
    }

    /**
     * Return a list of products with optional filters.
     *
     * @param bool        $adminMode   If true, include inactive products.
     * @param string|null $category
     * @param string|null $search
     */
    public static function findAll(
        mysqli  $db,
        bool    $adminMode = false,
        ?string $category  = null,
        ?string $search    = null
    ): array {
        $conditions = $adminMode ? [] : ['is_active = 1'];
        $params     = [];
        $types      = '';

        if ($category !== null && in_array($category, PRODUCT_CATEGORIES, true)) {
            $conditions[] = 'category = ?';
            $params[]     = $category;
            $types       .= 's';
        }

        if ($search !== null && $search !== '') {
            // Escape LIKE special characters (%, _) to prevent unexpected wildcard behaviour
            $escaped      = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], mb_substr($search, 0, 100));
            $s            = '%' . $escaped . '%';
            $conditions[] = '(name_ar LIKE ? OR name_en LIKE ? OR brand LIKE ?)';
            $params       = array_merge($params, [$s, $s, $s]);
            $types       .= 'sss';
        }

        $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';
        $sql   = "SELECT * FROM products $where ORDER BY created_at DESC";
        $stmt  = $db->prepare($sql);
        if (!$stmt) return [];
        if ($types && count($params)) {
            $stmt->bind_param($types, ...$params);
        }
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $rows;
    }

    /**
     * Insert a new product.
     *
     * @param array $data  Associative array of product fields.
     * @return int         New product ID, 0 on failure.
     */
    public static function create(mysqli $db, array $data): int {
        $stmt = $db->prepare(
            "INSERT INTO products
                (name_ar, name_en, brand, origin, category,
                 description_ar, description_en, price, price_before,
                 stock, image, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        if (!$stmt) return 0;
        $stmt->bind_param(
            'sssssssddisi',
            $data['name_ar'], $data['name_en'], $data['brand'],
            $data['origin'], $data['category'],
            $data['description_ar'], $data['description_en'],
            $data['price'], $data['price_before'],
            $data['stock'], $data['image'], $data['is_active']
        );
        $stmt->execute();
        $newId = $db->insert_id;
        $stmt->close();
        return $newId;
    }

    /**
     * Update an existing product.
     */
    public static function update(mysqli $db, int $id, array $data): bool {
        $stmt = $db->prepare(
            "UPDATE products SET
                name_ar=?, name_en=?, brand=?, origin=?, category=?,
                description_ar=?, description_en=?, price=?, price_before=?,
                stock=?, image=?, is_active=?
             WHERE id=?"
        );
        if (!$stmt) return false;
        $stmt->bind_param(
            'sssssssddisii',
            $data['name_ar'], $data['name_en'], $data['brand'],
            $data['origin'], $data['category'],
            $data['description_ar'], $data['description_en'],
            $data['price'], $data['price_before'],
            $data['stock'], $data['image'], $data['is_active'],
            $id
        );
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    /**
     * Soft-delete a product (set is_active = 0).
     */
    public static function softDelete(mysqli $db, int $id): bool {
        $stmt = $db->prepare("UPDATE products SET is_active = 0 WHERE id = ?");
        if (!$stmt) return false;
        $stmt->bind_param('i', $id);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    /**
     * Decrement stock for a product (used when creating an order).
     */
    public static function decrementStock(mysqli $db, int $id, int $qty): bool {
        $stmt = $db->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
        if (!$stmt) return false;
        $stmt->bind_param('ii', $qty, $id);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    /**
     * Set the stock level directly.
     */
    public static function setStock(mysqli $db, int $id, int $newStock): bool {
        $stmt = $db->prepare("UPDATE products SET stock = ? WHERE id = ?");
        if (!$stmt) return false;
        $stmt->bind_param('ii', $newStock, $id);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }
}
