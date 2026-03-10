<?php
// ─────────────────────────────────────────────────────────────
// models/Product.php — Product model
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../config/constants.php';
require_once __DIR__ . '/../helpers/security.php';

class Product {
    /**
     * Ensure the `images` TEXT column exists (one-time auto-migration).
     * Silently ignores MySQL error 1060 (duplicate column).
     */
    public static function ensureImagesColumn($db) {
        $db->query(
            "ALTER TABLE products ADD COLUMN images TEXT NULL DEFAULT NULL AFTER image"
        );
        // Error 1060 = duplicate column name — safe to ignore
        $db->errno; // suppress PHP warning by accessing errno
    }

    /**
     * Decode the `images` column (or legacy `image` column) into an array,
     * and add convenience `images_arr` and updated `image` keys to a row.
     */
    private static function decodeImages(array &$row) {
        // `images` column (JSON array) takes priority over legacy `image`
        $raw = isset($row['images']) && $row['images'] !== null && $row['images'] !== ''
            ? $row['images']
            : ($row['image'] ?? '');

        $arr = parseProductImages($raw);

        // Backward-compat: keep `image` as the first URL
        $row['image']      = $arr[0] ?? '';
        $row['images_arr'] = $arr;
    }

    /**
     * Find one product by ID. Returns array or null.
     */
    public static function findById($db, $id, $activeOnly = true) {
        $sql = $activeOnly
            ? "SELECT * FROM products WHERE id = ? AND is_active = 1 LIMIT 1"
            : "SELECT * FROM products WHERE id = ? LIMIT 1";
        $stmt = $db->prepare($sql);
        if (!$stmt) return null;
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        if (!$row) return null;
        self::decodeImages($row);
        return $row;
    }

    /**
     * Return a list of products with optional filters.
     */
    public static function findAll($db, $adminMode = false, $category = null, $search = null) {
        $conditions = $adminMode ? [] : ['is_active = 1'];
        $params     = [];
        $types      = '';

        if ($category !== null && in_array($category, PRODUCT_CATEGORIES, true)) {
            $conditions[] = 'category = ?';
            $params[]     = $category;
            $types       .= 's';
        }

        if ($search !== null && $search !== '') {
            // Escape LIKE special characters to prevent unexpected wildcard behaviour
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
        foreach ($rows as &$row) {
            self::decodeImages($row);
        }
        unset($row);
        return $rows;
    }

    /**
     * Insert a new product. Returns new ID or 0.
     */
    public static function create($db, $data) {
        $imagesJson = self::encodeImages($data);
        $firstImage = $data['image'] ?? '';
        $stmt = $db->prepare(
            "INSERT INTO products
                (name_ar, name_en, brand, origin, category,
                 description_ar, description_en, price, price_before,
                 stock, image, images, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        if (!$stmt) return 0;
        $stmt->bind_param(
            'sssssssddissi',
            $data['name_ar'], $data['name_en'], $data['brand'],
            $data['origin'], $data['category'],
            $data['description_ar'], $data['description_en'],
            $data['price'], $data['price_before'],
            $data['stock'], $firstImage, $imagesJson, $data['is_active']
        );
        $stmt->execute();
        $newId = $db->insert_id;
        $stmt->close();
        return (int)$newId;
    }

    /**
     * Update an existing product.
     */
    public static function update($db, $id, $data) {
        $imagesJson = self::encodeImages($data);
        $firstImage = $data['image'] ?? '';
        $stmt = $db->prepare(
            "UPDATE products SET
                name_ar=?, name_en=?, brand=?, origin=?, category=?,
                description_ar=?, description_en=?, price=?, price_before=?,
                stock=?, image=?, images=?, is_active=?
             WHERE id=?"
        );
        if (!$stmt) return false;
        $stmt->bind_param(
            'sssssssddissii',
            $data['name_ar'], $data['name_en'], $data['brand'],
            $data['origin'], $data['category'],
            $data['description_ar'], $data['description_en'],
            $data['price'], $data['price_before'],
            $data['stock'], $firstImage, $imagesJson, $data['is_active'],
            $id
        );
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    /**
     * Encode images array for storage.
     * Stores first URL in `image` (legacy), full JSON array in `images`.
     */
    private static function encodeImages(array $data): ?string {
        $arr = $data['images_arr'] ?? [];
        if (empty($arr)) {
            // Fall back to single `image` field if no array provided
            $arr = !empty($data['image']) ? [$data['image']] : [];
        }
        return empty($arr) ? null : json_encode(array_values($arr), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
    }

    /**
     * Soft-delete a product (set is_active = 0).
     */
    public static function softDelete($db, $id) {
        $stmt = $db->prepare("UPDATE products SET is_active = 0 WHERE id = ?");
        if (!$stmt) return false;
        $stmt->bind_param('i', $id);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }

    /**
     * Decrement stock for a product.
     */
    public static function decrementStock($db, $id, $qty) {
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
    public static function setStock($db, $id, $newStock) {
        $stmt = $db->prepare("UPDATE products SET stock = ? WHERE id = ?");
        if (!$stmt) return false;
        $stmt->bind_param('ii', $newStock, $id);
        $ok = $stmt->execute();
        $stmt->close();
        return $ok;
    }
}
