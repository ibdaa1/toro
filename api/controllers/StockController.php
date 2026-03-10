<?php
// ─────────────────────────────────────────────────────────────
// controllers/StockController.php
// Handles GET/POST /stock.php (admin only)
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../models/StockMovement.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../helpers/auth_helper.php';
require_once __DIR__ . '/../helpers/security.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/constants.php';

class StockController {
    public function handle(): void {
        $method = reqMethod();
        $id     = qInt('id') ?: null;

        switch ($method) {
            case 'GET':  $this->get($id);  break;
            case 'POST': $this->post();    break;
            default:     err('Method not allowed', 405);
        }
    }

    private function get(?int $id): void {
        authUser(true);
        $db = getDB();

        if (!StockMovement::ensureTable($db)) { $db->close(); ok([]); }

        $limit  = clamp(qInt('limit', 50), 10, MAX_PAGE_LIMIT);
        $offset = max(0, qInt('offset', 0));
        $rows   = StockMovement::findAll($db, $id, $limit, $offset);
        $db->close();
        ok($rows);
    }

    private function post(): void {
        $user      = authUser(true);
        $body      = getBody();
        $productId = (int)($body['product_id'] ?? 0);
        $typeRaw   = sanitize($body['type']     ?? 'in', 20);
        $qty       = (int)($body['quantity']    ?? 0);
        $reason    = sanitize($body['reason']   ?? '', 255);

        if (!in_array($typeRaw, STOCK_TYPES, true)) err('نوع الحركة غير صحيح / Invalid movement type');
        if ($productId <= 0)                         err('product_id required');
        if ($qty <= 0)                               err('الكمية يجب أن تكون أكبر من صفر / Quantity must be > 0');

        $db = getDB();
        if (!StockMovement::ensureTable($db)) { $db->close(); err('Stock table setup failed', 500); }

        $prod = Product::findById($db, $productId, false);
        if (!$prod) { $db->close(); err('Product not found', 404); }

        $currentStock = (int)$prod['stock'];

        if ($typeRaw === 'in') {
            $newStock = $currentStock + $qty;
        } elseif ($typeRaw === 'out') {
            if ($qty > $currentStock) { $db->close(); err('الكمية المطلوبة أكبر من المخزون / Insufficient stock'); }
            $newStock = $currentStock - $qty;
        } else {
            // adjustment: set to the supplied absolute value
            $newStock = $qty;
        }

        $ok = Product::setStock($db, $productId, $newStock);
        if (!$ok) { $db->close(); err('Stock update failed', 500); }

        $movId = StockMovement::record($db, $productId, $typeRaw, $qty, $newStock, $reason, (int)$user['id']);
        $db->close();

        if (!$movId) err('Movement record failed', 500);
        ok(['id' => $movId, 'new_stock' => $newStock, 'msg' => 'Stock updated']);
    }
}
