<?php
// stock.php — Stock movement tracking and inventory management
require_once 'cors.php';
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

// ─── GET — list movements ──────────────────────────────
if ($method === 'GET') {
    authUser(true);
    $db = getDB();

    if ($id) {
        // Movements for a specific product
        $stmt = $db->prepare(
            "SELECT sm.*, p.name_ar, p.name_en, p.brand, u.name AS admin_name
             FROM stock_movements sm
             JOIN products p ON sm.product_id = p.id
             LEFT JOIN users u ON sm.user_id = u.id
             WHERE sm.product_id = ?
             ORDER BY sm.created_at DESC
             LIMIT 100"
        );
        $stmt->bind_param('i', $id);
    } else {
        // All movements with pagination
        $limit  = min(100, max(10, (int)($_GET['limit'] ?? 50)));
        $offset = max(0, (int)($_GET['offset'] ?? 0));
        $stmt = $db->prepare(
            "SELECT sm.*, p.name_ar, p.name_en, p.brand, u.name AS admin_name
             FROM stock_movements sm
             JOIN products p ON sm.product_id = p.id
             LEFT JOIN users u ON sm.user_id = u.id
             ORDER BY sm.created_at DESC
             LIMIT ? OFFSET ?"
        );
        $stmt->bind_param('ii', $limit, $offset);
    }
    $stmt->execute();
    $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
    $db->close();
    ok($rows);
}

// ─── POST — add stock movement ─────────────────────────
if ($method === 'POST') {
    $user      = authUser(true);
    $productId = (int)($body['product_id'] ?? 0);
    $typeRaw   = trim($body['type'] ?? 'in');
    $qty       = (int)($body['quantity'] ?? 0);
    $reason    = trim(strip_tags($body['reason'] ?? ''));

    $allowedTypes = ['in', 'out', 'adjustment'];
    if (!in_array($typeRaw, $allowedTypes, true)) err('نوع الحركة غير صحيح / Invalid movement type');
    if ($productId <= 0) err('product_id required');
    if ($qty <= 0)       err('الكمية يجب أن تكون أكبر من صفر / Quantity must be > 0');

    $db = getDB();

    // Fetch current stock
    $pStmt = $db->prepare("SELECT id, stock FROM products WHERE id = ? LIMIT 1");
    $pStmt->bind_param('i', $productId);
    $pStmt->execute();
    $prod = $pStmt->get_result()->fetch_assoc();
    $pStmt->close();
    if (!$prod) { $db->close(); err('Product not found', 404); }

    $currentStock = (int)$prod['stock'];

    // Calculate new stock
    if ($typeRaw === 'in') {
        $newStock = $currentStock + $qty;
    } elseif ($typeRaw === 'out') {
        if ($qty > $currentStock) { $db->close(); err('الكمية المطلوبة أكبر من المخزون / Insufficient stock'); }
        $newStock = $currentStock - $qty;
    } else {
        // 'adjustment': sets the stock to the supplied quantity directly (absolute value).
        // Use this for physical inventory counts to correct the recorded balance.
        $newStock = $qty;
    }

    // Update product stock
    $upd = $db->prepare("UPDATE products SET stock = ? WHERE id = ?");
    $upd->bind_param('ii', $newStock, $productId);
    if (!$upd->execute()) { $db->close(); err('Stock update failed: '.$upd->error, 500); }
    $upd->close();

    // Record movement
    $uid = (int)$user['id'];
    $ins = $db->prepare(
        "INSERT INTO stock_movements (product_id, type, quantity, balance, reason, user_id)
         VALUES (?, ?, ?, ?, ?, ?)"
    );
    $ins->bind_param('isiisi', $productId, $typeRaw, $qty, $newStock, $reason, $uid);
    if (!$ins->execute()) { $db->close(); err('Movement record failed: '.$ins->error, 500); }
    $movId = $db->insert_id;
    $ins->close();
    $db->close();

    ok(['id' => $movId, 'new_stock' => $newStock, 'msg' => 'Stock updated']);
}

err('Method not allowed', 405);
