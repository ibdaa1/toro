<?php
// payments.php — Payment management endpoint
require_once 'cors.php';
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

// ─── GET ───────────────────────────────────────────────
if ($method === 'GET') {
    $user = authUser();
    $db   = getDB();

    if ($user['role'] === 'admin') {
        // Admin: get all payments with order and user info
        $sql = "SELECT p.*, o.status AS order_status, u.name AS user_name, u.email
                FROM payments p
                JOIN orders o ON p.order_id = o.id
                JOIN users  u ON p.user_id  = u.id
                ORDER BY p.created_at DESC";
        if ($id) {
            $stmt = $db->prepare($sql . " LIMIT 1");
        } else {
            $stmt = $db->prepare($sql);
        }
    } else {
        // Customer: only their own payments
        $stmt = $db->prepare(
            "SELECT p.*, o.status AS order_status
             FROM payments p
             JOIN orders o ON p.order_id = o.id
             WHERE p.user_id = ?
             ORDER BY p.created_at DESC"
        );
        $stmt->bind_param('i', $user['id']);
    }

    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $db->close();
    ok($rows);
}

// ─── POST — create payment record ──────────────────────
if ($method === 'POST') {
    $user     = authUser();
    $orderId  = (int)($body['order_id']    ?? 0);
    $method_  = trim($body['method']       ?? 'cod');
    $schedDate = trim($body['scheduled_date'] ?? '');
    $reference = trim(strip_tags($body['reference'] ?? ''));
    $notes     = trim(strip_tags($body['notes']     ?? ''));

    $allowedMethods = ['cod', 'card', 'bank_transfer', 'scheduled'];
    if (!in_array($method_, $allowedMethods, true)) {
        err('Invalid payment method');
    }
    if ($orderId <= 0) err('Order ID required');

    $db = getDB();

    // Verify the order belongs to this user (or user is admin)
    $stmt = $db->prepare("SELECT id, total, user_id FROM orders WHERE id = ? LIMIT 1");
    $stmt->bind_param('i', $orderId);
    $stmt->execute();
    $order = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$order) { $db->close(); err('Order not found', 404); }
    if ($user['role'] !== 'admin' && $order['user_id'] != $user['id']) {
        $db->close(); err('Not authorized', 403);
    }

    $amount   = (float)$order['total'];
    $userId   = (int)$order['user_id'];
    $sdParam  = ($method_ === 'scheduled' && $schedDate) ? $schedDate : null;

    // Check no duplicate payment for this order
    $chk = $db->prepare("SELECT id FROM payments WHERE order_id = ? LIMIT 1");
    $chk->bind_param('i', $orderId);
    $chk->execute();
    if ($chk->get_result()->num_rows > 0) {
        $chk->close(); $db->close();
        err('Payment record already exists for this order');
    }
    $chk->close();

    $stmt = $db->prepare(
        "INSERT INTO payments (order_id, user_id, amount, method, scheduled_date, reference, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    $stmt->bind_param('iidssss', $orderId, $userId, $amount, $method_, $sdParam, $reference, $notes);
    if (!$stmt->execute()) { $db->close(); err('Insert failed: ' . $stmt->error, 500); }
    $newId = $db->insert_id;
    $stmt->close();
    $db->close();
    ok(['id' => $newId, 'msg' => 'Payment record created']);
}

// ─── PUT — update payment status ───────────────────────
if ($method === 'PUT' && $id) {
    authUser(true); // admin only
    $newStatus = trim($body['status'] ?? '');
    $reference = trim(strip_tags($body['reference'] ?? ''));
    $notes     = trim(strip_tags($body['notes']     ?? ''));

    $allowedStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!in_array($newStatus, $allowedStatuses, true)) {
        err('Invalid payment status');
    }

    $db   = getDB();
    $stmt = $db->prepare(
        "UPDATE payments SET status = ?, reference = ?, notes = ? WHERE id = ?"
    );
    $stmt->bind_param('sssi', $newStatus, $reference, $notes, $id);
    if (!$stmt->execute()) { $db->close(); err('Update failed: ' . $stmt->error, 500); }
    $stmt->close();

    // If payment is confirmed (paid), also mark order as confirmed
    if ($newStatus === 'paid') {
        $s2 = $db->prepare(
            "UPDATE orders SET status = 'confirmed'
             WHERE id = (SELECT order_id FROM payments WHERE id = ?)
               AND status = 'pending'"
        );
        $s2->bind_param('i', $id);
        $s2->execute();
        $s2->close();
    }

    $db->close();
    ok(['msg' => 'Payment updated']);
}

err('Method not allowed', 405);
