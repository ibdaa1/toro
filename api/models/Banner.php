<?php
// ─────────────────────────────────────────────────────────────
// models/Banner.php — Banner model
// Banners are displayed as a full-width image carousel on the storefront.
// Each banner has an image (relative URL), optional title and subtitle,
// an optional link, sort order, and active flag.
// ─────────────────────────────────────────────────────────────

class Banner {
    /**
     * Auto-create the banners table if it doesn't exist.
     */
    public static function ensureTable($db) {
        $db->query("CREATE TABLE IF NOT EXISTS `banners` (
            `id`         INT AUTO_INCREMENT PRIMARY KEY,
            `title_ar`   VARCHAR(255) DEFAULT '',
            `title_en`   VARCHAR(255) DEFAULT '',
            `subtitle_ar` VARCHAR(500) DEFAULT '',
            `subtitle_en` VARCHAR(500) DEFAULT '',
            `image_url`  VARCHAR(512) NOT NULL DEFAULT '',
            `link`       VARCHAR(512) DEFAULT '',
            `sort_order` INT DEFAULT 0,
            `is_active`  TINYINT(1) DEFAULT 1,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
    }

    /** Return all banners; admin sees all, public only active ones. */
    public static function findAll($db, $adminMode = false) {
        self::ensureTable($db);
        $sql = $adminMode
            ? "SELECT * FROM banners ORDER BY sort_order ASC, id ASC"
            : "SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC";
        $res = $db->query($sql);
        if (!$res) return [];
        $rows = [];
        while ($row = $res->fetch_assoc()) {
            $rows[] = $row;
        }
        return $rows;
    }

    /** Find one banner by ID. */
    public static function findById($db, $id) {
        self::ensureTable($db);
        $stmt = $db->prepare("SELECT * FROM banners WHERE id = ? LIMIT 1");
        if (!$stmt) return null;
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $row ?: null;
    }

    /** Create a new banner. Returns the new ID or false. */
    public static function create($db, array $data) {
        self::ensureTable($db);
        $stmt = $db->prepare(
            "INSERT INTO banners (title_ar, title_en, subtitle_ar, subtitle_en, image_url, link, sort_order, is_active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        if (!$stmt) return false;
        $title_ar    = trim($data['title_ar']    ?? '');
        $title_en    = trim($data['title_en']    ?? '');
        $subtitle_ar = trim($data['subtitle_ar'] ?? '');
        $subtitle_en = trim($data['subtitle_en'] ?? '');
        $image_url   = trim($data['image_url']   ?? '');
        $link        = trim($data['link']        ?? '');
        $sort_order  = (int)($data['sort_order'] ?? 0);
        $is_active   = isset($data['is_active']) ? (int)(bool)$data['is_active'] : 1;
        $stmt->bind_param('ssssssii',
            $title_ar, $title_en, $subtitle_ar, $subtitle_en,
            $image_url, $link, $sort_order, $is_active
        );
        $stmt->execute();
        $newId = $stmt->insert_id;
        $stmt->close();
        return $newId ?: false;
    }

    /** Update an existing banner. Returns true on success. */
    public static function update($db, $id, array $data) {
        self::ensureTable($db);
        $stmt = $db->prepare(
            "UPDATE banners SET title_ar=?, title_en=?, subtitle_ar=?, subtitle_en=?,
             image_url=?, link=?, sort_order=?, is_active=? WHERE id=?"
        );
        if (!$stmt) return false;
        $title_ar    = trim($data['title_ar']    ?? '');
        $title_en    = trim($data['title_en']    ?? '');
        $subtitle_ar = trim($data['subtitle_ar'] ?? '');
        $subtitle_en = trim($data['subtitle_en'] ?? '');
        $image_url   = trim($data['image_url']   ?? '');
        $link        = trim($data['link']        ?? '');
        $sort_order  = (int)($data['sort_order'] ?? 0);
        $is_active   = isset($data['is_active']) ? (int)(bool)$data['is_active'] : 1;
        $stmt->bind_param('ssssssiii',
            $title_ar, $title_en, $subtitle_ar, $subtitle_en,
            $image_url, $link, $sort_order, $is_active, $id
        );
        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();
        return $affected >= 0;
    }

    /** Delete a banner by ID. Returns true on success. */
    public static function delete($db, $id) {
        self::ensureTable($db);
        $stmt = $db->prepare("DELETE FROM banners WHERE id = ?");
        if (!$stmt) return false;
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $affected = $stmt->affected_rows;
        $stmt->close();
        return $affected > 0;
    }
}
