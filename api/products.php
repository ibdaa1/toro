<?php
// products.php — محمي من SQL Injection
require_once 'cors.php';
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

// ─── GET ───────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $db = getDB();

    if ($id) {
        $stmt = $db->prepare("SELECT * FROM products WHERE id = ? AND is_active = 1 LIMIT 1");
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $p = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        $db->close();
        if (!$p) err('Product not found', 404);
        ok($p);
    }

    // Admin mode: return ALL products (including inactive) for inventory management
    // Triggered by ?admin=1 with a valid admin token
    $adminMode = false;
    if (!empty($_GET['admin'])) {
        authUser(true);  // throws 401/403 if not admin; if execution continues, user is admin
        $adminMode = true;
    }

    // بناء الاستعلام بشكل آمن
    $conditions = $adminMode ? [] : ["is_active = 1"];
    $params     = [];
    $types      = '';

    $allowedCats = ['men', 'women', 'unisex'];
    if (!empty($_GET['category']) && in_array($_GET['category'], $allowedCats)) {
        $conditions[] = "category = ?";
        $params[]     = $_GET['category'];
        $types       .= 's';
    }

    if (!empty($_GET['search'])) {
        $s          = '%' . $db->real_escape_string(mb_substr($_GET['search'], 0, 100)) . '%';
        // نستخدم ? في prepared statement
        $conditions[] = "(name_ar LIKE ? OR name_en LIKE ? OR brand LIKE ?)";
        $params       = array_merge($params, [$s, $s, $s]);
        $types       .= 'sss';
    }

    $where = $conditions ? 'WHERE ' . implode(' AND ', $conditions) : '';
    $sql   = "SELECT * FROM products $where ORDER BY created_at DESC";
    $stmt  = $db->prepare($sql);
    if ($types && count($params)) {
        $stmt->bind_param($types, ...$params);
    }
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $db->close();
    ok($rows);
}

// ─── POST (Create) ─────────────────────────────────────────────────────
if ($method === 'POST') {
    authUser(true); // admin only
    $db = getDB();

    $nameAr  = trim(strip_tags($body['name_ar']  ?? ''));
    $nameEn  = trim(strip_tags($body['name_en']  ?? ''));
    $brand   = trim(strip_tags($body['brand']    ?? ''));
    $origin  = trim(strip_tags($body['origin']   ?? ''));
    $descAr  = trim($body['description_ar'] ?? '');
    $descEn  = trim($body['description_en'] ?? '');
    $price   = round((float)($body['price'] ?? 0), 2);
    $pBefore = !empty($body['price_before']) ? round((float)$body['price_before'], 2) : null;
    $stock   = max(0, (int)($body['stock'] ?? 0));
    $rawImg  = trim($body['image'] ?? '');
    $image   = (preg_match('#^https?://#i', $rawImg) && strlen($rawImg) <= 500) ? $rawImg : '';
    $active  = isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1;

    $allowedCats = ['men', 'women', 'unisex'];
    $category    = in_array($body['category'] ?? '', $allowedCats) ? $body['category'] : 'unisex';

    if (!$nameAr || !$nameEn || !$brand || $price <= 0) {
        $db->close();
        err('اسم المنتج والسعر مطلوبان / Name and price required');
    }

    $stmt = $db->prepare(
        "INSERT INTO products (name_ar, name_en, brand, origin, category, description_ar, description_en, price, price_before, stock, image, is_active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param('sssssssddisi',
        $nameAr, $nameEn, $brand, $origin, $category,
        $descAr, $descEn, $price, $pBefore, $stock, $image, $active
    );
    if (!$stmt->execute()) { $db->close(); err('Insert failed: '.$stmt->error, 500); }
    $newId = $db->insert_id;
    $stmt->close();
    $db->close();
    ok(['id' => $newId, 'msg' => 'Product created']);
}

// ─── PUT (Update) ──────────────────────────────────────────────────────
if ($method === 'PUT' && $id) {
    authUser(true);
    $db = getDB();

    $nameAr  = trim(strip_tags($body['name_ar']  ?? ''));
    $nameEn  = trim(strip_tags($body['name_en']  ?? ''));
    $brand   = trim(strip_tags($body['brand']    ?? ''));
    $origin  = trim(strip_tags($body['origin']   ?? ''));
    $descAr  = trim($body['description_ar'] ?? '');
    $descEn  = trim($body['description_en'] ?? '');
    $price   = round((float)($body['price'] ?? 0), 2);
    $pBefore = !empty($body['price_before']) ? round((float)$body['price_before'], 2) : null;
    $stock   = max(0, (int)($body['stock']  ?? 0));
    $rawImg  = trim($body['image'] ?? '');
    $image   = (preg_match('#^https?://#i', $rawImg) && strlen($rawImg) <= 500) ? $rawImg : '';
    $active  = isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1;

    $allowedCats = ['men', 'women', 'unisex'];
    $category    = in_array($body['category'] ?? '', $allowedCats) ? $body['category'] : 'unisex';

    if (!$nameAr || !$nameEn || !$brand || $price <= 0) {
        $db->close();
        err('البيانات غير مكتملة / Missing required fields');
    }

    $stmt = $db->prepare(
        "UPDATE products SET name_ar=?, name_en=?, brand=?, origin=?, category=?,
         description_ar=?, description_en=?, price=?, price_before=?, stock=?,
         image=?, is_active=? WHERE id=?"
    );
    $stmt->bind_param('sssssssddisii',
        $nameAr, $nameEn, $brand, $origin, $category,
        $descAr, $descEn, $price, $pBefore, $stock, $image, $active, $id
    );
    if (!$stmt->execute()) { $db->close(); err('Update failed: '.$stmt->error, 500); }
    $stmt->close();
    $db->close();
    ok(['msg' => 'Updated']);
}

// ─── DELETE (Soft) ─────────────────────────────────────────────────────
if ($method === 'DELETE' && $id) {
    authUser(true);
    $db   = getDB();
    $stmt = $db->prepare("UPDATE products SET is_active = 0 WHERE id = ?");
    $stmt->bind_param('i', $id);
    $stmt->execute();
    $stmt->close();
    $db->close();
    ok(['msg' => 'Deleted']);
}

err('Method not allowed', 405);