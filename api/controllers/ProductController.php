<?php
// ─────────────────────────────────────────────────────────────
// controllers/ProductController.php
// Handles GET/POST/PUT/DELETE /products.php
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../helpers/auth_helper.php';
require_once __DIR__ . '/../helpers/security.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/constants.php';

class ProductController {
    public function handle(): void {
        $method = reqMethod();
        $id     = qInt('id') ?: null;

        switch ($method) {
            case 'GET':    $this->get($id);    break;
            case 'POST':   $this->post();      break;
            case 'PUT':    $this->put($id);    break;
            case 'DELETE': $this->delete($id); break;
            default:       err('Method not allowed', 405);
        }
    }

    private function get(?int $id): void {
        $db = getDB();

        if ($id) {
            $p = Product::findById($db, $id);
            $db->close();
            if (!$p) err('Product not found', 404);
            ok($p);
        }

        $adminMode = false;
        if (!empty($_GET['admin'])) {
            authUser(true);
            $adminMode = true;
        }

        $category = qStr('category') ?: null;
        $search   = qStr('search')   ?: null;
        $rows     = Product::findAll($db, $adminMode, $category, $search);
        $db->close();
        ok($rows);
    }

    private function post(): void {
        authUser(true);
        $db   = getDB();
        $data = $this->parseBody();

        if (!$data['name_ar'] || !$data['name_en'] || !$data['brand'] || $data['price'] <= 0) {
            $db->close();
            err('اسم المنتج والسعر مطلوبان / Name and price required');
        }

        $newId = Product::create($db, $data);
        $db->close();

        if (!$newId) err('Insert failed', 500);
        ok(['id' => $newId, 'msg' => 'Product created']);
    }

    private function put(?int $id): void {
        if (!$id) err('ID required', 400);
        authUser(true);
        $db   = getDB();
        $data = $this->parseBody();

        if (!$data['name_ar'] || !$data['name_en'] || !$data['brand'] || $data['price'] <= 0) {
            $db->close();
            err('البيانات غير مكتملة / Missing required fields');
        }

        $ok = Product::update($db, $id, $data);
        $db->close();

        if (!$ok) err('Update failed', 500);
        ok(['msg' => 'Updated']);
    }

    private function delete(?int $id): void {
        if (!$id) err('ID required', 400);
        authUser(true);
        $db = getDB();
        Product::softDelete($db, $id);
        $db->close();
        ok(['msg' => 'Deleted']);
    }

    private function parseBody(): array {
        $body    = getBody();
        $rawImg  = trim($body['image'] ?? '');

        return [
            'name_ar'        => sanitize($body['name_ar']       ?? '', 200),
            'name_en'        => sanitize($body['name_en']       ?? '', 200),
            'brand'          => sanitize($body['brand']         ?? '', 100),
            'origin'         => sanitize($body['origin']        ?? '', 100),
            'category'       => in_array($body['category'] ?? '', PRODUCT_CATEGORIES, true)
                                    ? $body['category'] : 'unisex',
            'description_ar' => trim($body['description_ar']   ?? ''),
            'description_en' => trim($body['description_en']   ?? ''),
            'price'          => round((float)($body['price']   ?? 0), 2),
            'price_before'   => !empty($body['price_before'])
                                    ? round((float)$body['price_before'], 2) : null,
            'stock'          => max(0, (int)($body['stock']    ?? 0)),
            'image'          => isValidImageUrl($rawImg) ? $rawImg : '',
            'is_active'      => isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1,
        ];
    }
}
