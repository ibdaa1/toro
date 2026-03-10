<?php
// ─────────────────────────────────────────────────────────────
// controllers/OrderController.php
// Handles GET/POST/PUT /orders.php
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../models/Payment.php';
require_once __DIR__ . '/../helpers/auth_helper.php';
require_once __DIR__ . '/../helpers/security.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/constants.php';

class OrderController {
    public function handle(): void {
        $method = reqMethod();
        $id     = qInt('id') ?: null;

        switch ($method) {
            case 'GET':  $this->get();       break;
            case 'POST': $this->post();      break;
            case 'PUT':  $this->put($id);    break;
            default:     err('Method not allowed', 405);
        }
    }

    private function get(): void {
        $user = authUser();
        $db   = getDB();
        $rows = Order::findAll($db, $user['role'] === 'admin' ? null : (int)$user['id']);
        $db->close();
        ok($rows);
    }

    private function post(): void {
        $user  = authUser();
        $body  = getBody();
        $items = $body['items']   ?? [];
        $addr  = sanitize($body['address'] ?? '', 500);
        $notes = sanitize($body['notes']   ?? '', 300);

        if (empty($items) || !is_array($items)) err('السلة فارغة / Cart is empty');
        if (!$addr)                              err('العنوان مطلوب / Address required');
        if (mb_strlen($addr) > 500)              err('العنوان طويل جداً');
        if (mb_strlen($notes) > 300)             err('الملاحظات طويلة جداً');
        if (count($items) > 50)                  err('عدد المنتجات كبير جداً');

        $db        = getDB();
        $total     = 0.0;
        $safeItems = [];

        foreach ($items as $item) {
            $pid = (int)($item['product_id'] ?? 0);
            $qty = (int)($item['qty'] ?? 1);
            if ($pid <= 0 || $qty <= 0 || $qty > 1000) {
                $db->close();
                err("بيانات المنتج غير صحيحة: $pid");
            }
            $p = Product::findById($db, $pid);
            if (!$p) { $db->close(); err("منتج غير موجود: $pid"); }
            if ($p['stock'] < $qty) { $db->close(); err("المخزون غير كافٍ للمنتج: $pid"); }

            $total     += (float)$p['price'] * $qty;
            $safeItems[] = ['product_id' => $pid, 'qty' => $qty, 'price' => (float)$p['price']];
        }

        $oid = Order::create($db, (int)$user['id'], $total, $addr, $notes);
        if (!$oid) { $db->close(); err('Order creation failed', 500); }

        foreach ($safeItems as $item) {
            Order::addItem($db, $oid, $item['product_id'], $item['qty'], $item['price']);
            Product::decrementStock($db, $item['product_id'], $item['qty']);
        }

        // Auto-create COD payment record
        Payment::createCOD($db, $oid, (int)$user['id'], $total);
        $db->close();

        ok(['order_id' => $oid, 'total' => round($total, 2)]);
    }

    private function put(?int $id): void {
        if (!$id) err('ID required', 400);
        authUser(true);
        $body      = getBody();
        $rawStatus = $body['status'] ?? '';
        if (!in_array($rawStatus, ORDER_STATUSES, true)) err('Invalid status');

        $db = getDB();
        Order::updateStatus($db, $id, $rawStatus);
        $db->close();
        ok(['msg' => 'Status updated']);
    }
}
