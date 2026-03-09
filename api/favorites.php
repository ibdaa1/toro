<?php
// favorites.php — Wishlist / favorites endpoint
require_once 'cors.php';
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];

// All actions require authentication
$user = authUser();

// ─── GET — list user's favorites ───────────────────────
if ($method === 'GET') {
    $db   = getDB();
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
    $stmt->bind_param('i', $user['id']);
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $db->close();
    ok($rows);
}

// ─── POST — toggle favorite (add or remove) ────────────
if ($method === 'POST') {
    $productId = (int)($body['product_id'] ?? 0);
    if ($productId <= 0) err('product_id required');

    $db = getDB();

    // Verify product exists
    $chk = $db->prepare("SELECT id FROM products WHERE id = ? AND is_active = 1 LIMIT 1");
    $chk->bind_param('i', $productId);
    $chk->execute();
    $exists = $chk->get_result()->num_rows;
    $chk->close();
    if (!$exists) { $db->close(); err('Product not found', 404); }

    // Check if already favorited
    $check = $db->prepare("SELECT id FROM favorites WHERE user_id = ? AND product_id = ? LIMIT 1");
    $check->bind_param('ii', $user['id'], $productId);
    $check->execute();
    $fav = $check->get_result()->fetch_assoc();
    $check->close();

    if ($fav) {
        // Already favorited — remove it
        $del = $db->prepare("DELETE FROM favorites WHERE user_id = ? AND product_id = ?");
        $del->bind_param('ii', $user['id'], $productId);
        $del->execute();
        $del->close();
        $db->close();
        ok(['action' => 'removed', 'product_id' => $productId]);
    } else {
        // Add to favorites
        $ins = $db->prepare("INSERT INTO favorites (user_id, product_id) VALUES (?, ?)");
        $ins->bind_param('ii', $user['id'], $productId);
        if (!$ins->execute()) { $db->close(); err('Failed to add: ' . $ins->error, 500); }
        $ins->close();
        $db->close();
        ok(['action' => 'added', 'product_id' => $productId]);
    }
}

// ─── DELETE — remove a specific favorite ───────────────
if ($method === 'DELETE') {
    $productId = isset($_GET['product_id']) ? (int)$_GET['product_id'] : 0;
    if ($productId <= 0) err('product_id required');

    $db   = getDB();
    $stmt = $db->prepare("DELETE FROM favorites WHERE user_id = ? AND product_id = ?");
    $stmt->bind_param('ii', $user['id'], $productId);
    $stmt->execute();
    $stmt->close();
    $db->close();
    ok(['msg' => 'Removed from favorites']);
}

err('Method not allowed', 405);
