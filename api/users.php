<?php
// users.php — admin only
require_once 'cors.php';
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$id     = isset($_GET['id']) ? (int)$_GET['id'] : null;

authUser(true); // فقط الأدمن

// ─── GET ───────────────────────────────────────────────
if ($method === 'GET') {
    $db = getDB();
    $rows = $db->query(
        "SELECT id, name, email, role, is_active, created_at FROM users ORDER BY created_at DESC"
    )->fetch_all(MYSQLI_ASSOC);
    $db->close();
    ok($rows);
}

// ─── PUT — toggle is_active ────────────────────────────
if ($method === 'PUT' && $id) {
    $newActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : null;
    if ($newActive === null) err('is_active required');

    $db = getDB();
    // Prevent deactivating the last admin — use prepared statement
    if ($newActive === 0) {
        $chkStmt = $db->prepare("SELECT COUNT(*) c FROM users WHERE role='admin' AND is_active=1 AND id != ?");
        $chkStmt->bind_param('i', $id);
        $chkStmt->execute();
        $remaining = (int)$chkStmt->get_result()->fetch_assoc()['c'];
        $chkStmt->close();
        if ($remaining === 0) {
            $db->close(); err('لا يمكن تعطيل آخر حساب مدير / Cannot deactivate the last admin');
        }
    }
    $stmt = $db->prepare("UPDATE users SET is_active = ? WHERE id = ?");
    $stmt->bind_param('ii', $newActive, $id);
    if (!$stmt->execute()) { $db->close(); err('Update failed: '.$stmt->error, 500); }
    $stmt->close();
    $db->close();
    ok(['msg' => $newActive ? 'User activated' : 'User deactivated']);
}

err('Method not allowed', 405);
