<?php
// ─────────────────────────────────────────────────────────────
// controllers/PaymentController.php
// Handles GET/POST/PUT /payments.php
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../models/Payment.php';
require_once __DIR__ . '/../models/Order.php';
require_once __DIR__ . '/../helpers/auth_helper.php';
require_once __DIR__ . '/../helpers/security.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/constants.php';

class PaymentController {
    public function handle(): void {
        $method = reqMethod();
        $id     = qInt('id') ?: null;

        switch ($method) {
            case 'GET':  $this->get();     break;
            case 'POST': $this->post();    break;
            case 'PUT':  $this->put($id);  break;
            default:     err('Method not allowed', 405);
        }
    }

    private function get(): void {
        $user = authUser();
        $db   = getDB();
        $rows = Payment::findAll($db, $user['role'] === 'admin' ? null : (int)$user['id']);
        $db->close();
        ok($rows);
    }

    private function post(): void {
        $user      = authUser();
        $body      = getBody();
        $orderId   = (int)($body['order_id']        ?? 0);
        $method_   = trim($body['method']           ?? 'cod');
        $schedDate = trim($body['scheduled_date']   ?? '');
        $reference = sanitize($body['reference']    ?? '', 100);
        $notes     = sanitize($body['notes']        ?? '', 500);

        if (!in_array($method_, PAYMENT_METHODS, true)) err('Invalid payment method');
        if ($orderId <= 0) err('Order ID required');

        $db    = getDB();
        $order = Order::findById($db, $orderId);

        if (!$order) { $db->close(); err('Order not found', 404); }
        if ($user['role'] !== 'admin' && $order['user_id'] != $user['id']) {
            $db->close(); err('Not authorized', 403);
        }

        if (Payment::existsForOrder($db, $orderId)) {
            $db->close();
            err('Payment record already exists for this order');
        }

        $amount    = (float)$order['total'];
        $userId    = (int)$order['user_id'];
        $sdParam   = ($method_ === 'scheduled' && $schedDate) ? $schedDate : null;
        $newId     = Payment::create($db, $orderId, $userId, $amount, $method_, $sdParam, $reference, $notes);
        $db->close();

        if (!$newId) err('Insert failed', 500);
        ok(['id' => $newId, 'msg' => 'Payment record created']);
    }

    private function put(?int $id): void {
        if (!$id) err('ID required', 400);
        authUser(true);
        $body      = getBody();
        $newStatus = trim($body['status']    ?? '');
        $reference = sanitize($body['reference'] ?? '', 100);
        $notes     = sanitize($body['notes']     ?? '', 500);

        if (!in_array($newStatus, PAYMENT_STATUSES, true)) err('Invalid payment status');

        $db = getDB();
        $ok = Payment::updateStatus($db, $id, $newStatus, $reference, $notes);
        if (!$ok) { $db->close(); err('Update failed', 500); }

        if ($newStatus === 'paid') {
            Payment::confirmOrderOnPaid($db, $id);
        }
        $db->close();
        ok(['msg' => 'Payment updated']);
    }
}
