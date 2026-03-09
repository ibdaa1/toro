<?php
// users.php — admin only
require_once 'cors.php';
require_once 'db.php';

authUser(true); // فقط الأدمن

$db = getDB();
// لا حاجة لـ prepared statement هنا — لا مدخلات خارجية
$rows = $db->query(
    "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
)->fetch_all(MYSQLI_ASSOC);
$db->close();
ok($rows);
