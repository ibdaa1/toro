<?php
require_once 'cors.php';
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];

// قراءة الـ body مرة واحدة فقط — لأن php://input لا يُقرأ مرتين
$rawBody = file_get_contents('php://input');
$body    = json_decode($rawBody, true) ?? [];

$id = isset($_GET['id']) ? (int)$_GET['id'] : null;

// ─── GET ───────────────────────────────────────────────────────────────
if ($method === 'GET') {
    $user = authUser();
    $db   = getDB();

    if ($user['role'] === 'admin') {
        $stmt = $db->prepare(
            "SELECT o.*, u.name AS user_name, u.email
             FROM orders o JOIN users u ON o.user_id = u.id
             ORDER BY o.created_at DESC"
        );
    } else {
        $stmt = $db->prepare("SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->bind_param('i', $user['id']);
    }
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();

    foreach ($rows as &$order) {
        $oid   = (int)$order['id'];
        $stmt2 = $db->prepare("SELECT oi.*, p.name_ar, p.name_en, p.image FROM order_items oi JOIN products p ON oi.product_id = p.id WHERE oi.order_id = ?");
        $stmt2->bind_param('i', $oid);
        $stmt2->execute();
        $order['items'] = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt2->close();
    }
    $db->close();
    ok($rows);
}

// ─── POST ──────────────────────────────────────────────────────────────
if ($method === 'POST') {
    $user  = authUser();
    $items = $body['items']   ?? [];
    $addr  = trim(strip_tags($body['address'] ?? ''));
    $notes = trim(strip_tags($body['notes']   ?? ''));

    if (empty($items) || !is_array($items)) err('السلة فارغة / Cart is empty');
    if (!$addr) err('العنوان مطلوب / Address required');
    if (mb_strlen($addr) > 500)  err('العنوان طويل جداً');
    if (mb_strlen($notes) > 300) err('الملاحظات طويلة جداً');
    if (count($items) > 50)      err('عدد المنتجات كبير جداً');

    $db        = getDB();
    $total     = 0.0;
    $safeItems = [];

    foreach ($items as $item) {
        $pid = (int)($item['product_id'] ?? 0);
        $qty = (int)($item['qty'] ?? 1);
        if ($pid <= 0 || $qty <= 0 || $qty > 1000) {
            $db->close(); err("بيانات المنتج غير صحيحة: $pid");
        }
        $stmt = $db->prepare("SELECT id, price, stock FROM products WHERE id = ? AND is_active = 1 LIMIT 1");
        $stmt->bind_param('i', $pid);
        $stmt->execute();
        $p = $stmt->get_result()->fetch_assoc();
        $stmt->close();

        if (!$p) { $db->close(); err("منتج غير موجود: $pid"); }
        if ($p['stock'] < $qty) { $db->close(); err("المخزون غير كافٍ للمنتج: $pid"); }

        $total += (float)$p['price'] * $qty;
        $safeItems[] = ['product_id' => $pid, 'qty' => $qty, 'price' => (float)$p['price']];
    }

    $stmt = $db->prepare("INSERT INTO orders (user_id, total, address, notes) VALUES (?, ?, ?, ?)");
    $stmt->bind_param('idss', $user['id'], $total, $addr, $notes);
    if (!$stmt->execute()) { $db->close(); err('Order creation failed: '.$stmt->error, 500); }
    $oid = $db->insert_id;
    $stmt->close();

    foreach ($safeItems as $item) {
        $s2 = $db->prepare("INSERT INTO order_items (order_id, product_id, qty, price) VALUES (?, ?, ?, ?)");
        $s2->bind_param('iiid', $oid, $item['product_id'], $item['qty'], $item['price']);
        $s2->execute(); $s2->close();

        $s3 = $db->prepare("UPDATE products SET stock = stock - ? WHERE id = ?");
        $s3->bind_param('ii', $item['qty'], $item['product_id']);
        $s3->execute(); $s3->close();
    }

    $db->close();
    ok(['order_id' => $oid, 'total' => round($total, 2)]);
}

// ─── PUT ───────────────────────────────────────────────────────────────
if ($method === 'PUT' && $id) {
    authUser(true);
    $rawStatus = $body['status'] ?? '';
    $allowed   = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!in_array($rawStatus, $allowed, true)) err('Invalid status');

    $db   = getDB();
    $stmt = $db->prepare("UPDATE orders SET status = ? WHERE id = ?");
    $stmt->bind_param('si', $rawStatus, $id);
    $stmt->execute();
    $stmt->close(); $db->close();
    ok(['msg' => 'Status updated']);
}

err('Method not allowed', 405);