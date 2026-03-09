<?php
// stats.php — admin only
require_once 'cors.php';
require_once 'db.php';

authUser(true);

$db = getDB();

// كل الاستعلامات آمنة (لا مدخلات خارجية)
$stats = [
    'total_products' => (int)$db->query("SELECT COUNT(*) c FROM products WHERE is_active = 1")->fetch_assoc()['c'],
    'total_orders'   => (int)$db->query("SELECT COUNT(*) c FROM orders")->fetch_assoc()['c'],
    'total_users'    => (int)$db->query("SELECT COUNT(*) c FROM users WHERE role = 'customer'")->fetch_assoc()['c'],
    'revenue'        => (float)$db->query("SELECT IFNULL(SUM(total), 0) s FROM orders WHERE status NOT IN ('cancelled')")->fetch_assoc()['s'],
    'pending_orders' => (int)$db->query("SELECT COUNT(*) c FROM orders WHERE status = 'pending'")->fetch_assoc()['c'],
];
$db->close();
ok($stats);
