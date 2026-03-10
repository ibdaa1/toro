<?php
// ─────────────────────────────────────────────────────────────
// controllers/StatsController.php
// Handles GET /stats.php (admin only)
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../helpers/auth_helper.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/constants.php';

class StatsController {
    public function handle(): void {
        if (reqMethod() !== 'GET') err('Method not allowed', 405);
        authUser(true);

        $db    = getDB();
        $stats = [
            'total_products' => (int)$db->query("SELECT COUNT(*) c FROM products WHERE is_active = 1")->fetch_assoc()['c'],
            'total_orders'   => (int)$db->query("SELECT COUNT(*) c FROM orders")->fetch_assoc()['c'],
            'total_users'    => (int)$db->query("SELECT COUNT(*) c FROM users WHERE role = 'customer'")->fetch_assoc()['c'],
            'revenue'        => (float)$db->query("SELECT IFNULL(SUM(total), 0) s FROM orders WHERE status NOT IN ('cancelled')")->fetch_assoc()['s'],
            'pending_orders' => (int)$db->query("SELECT COUNT(*) c FROM orders WHERE status = 'pending'")->fetch_assoc()['c'],
        ];
        $db->close();
        ok($stats);
    }
}
