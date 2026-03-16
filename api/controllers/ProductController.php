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
    public function handle() {
        $method = reqMethod();
        $id     = qInt('id') ? qInt('id') : null;

        switch ($method) {
            case 'GET':    $this->get($id);    break;
            case 'POST':   $this->post();      break;
            case 'PUT':    $this->put($id);    break;
            case 'DELETE': $this->delete($id); break;
            default:       err('Method not allowed', 405);
        }
    }

    private function get($id) {
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

        $category = qStr('category') ? qStr('category') : null;
        $search   = qStr('search')   ? qStr('search')   : null;
        $rows     = Product::findAll($db, $adminMode, $category, $search);
        $db->close();
        ok($rows);
    }

    private function post() {
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

    private function put($id) {
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

    private function delete($id) {
        if (!$id) err('ID required', 400);
        authUser(true);
        $db = getDB();
        Product::softDelete($db, $id);
        $db->close();
        ok(['msg' => 'Deleted']);
    }

    private function parseBody() {
        $body    = getBody();
        $rawImg  = trim(isset($body['image']) ? $body['image'] : '');

        // Support up to 3 images sent as `images_arr` array
        $imagesArr = [];
        if (!empty($body['images_arr']) && is_array($body['images_arr'])) {
            foreach (array_slice($body['images_arr'], 0, 3) as $u) {
                $u = trim((string)$u);
                if (isValidImageUrl($u)) {
                    $imagesArr[] = $u;
                }
            }
        }
        // Fall back to single `image` field
        if (empty($imagesArr) && isValidImageUrl($rawImg)) {
            $imagesArr = [$rawImg];
        }
        $firstImage = $imagesArr[0] ?? '';

        return [
            'name_ar'        => sanitize(isset($body['name_ar'])       ? $body['name_ar']       : '', 200),
            'name_en'        => sanitize(isset($body['name_en'])       ? $body['name_en']       : '', 200),
            'brand'          => sanitize(isset($body['brand'])         ? $body['brand']         : '', 100),
            'origin'         => sanitize(isset($body['origin'])        ? $body['origin']        : '', 100),
            'category'       => in_array(isset($body['category']) ? $body['category'] : '', PRODUCT_CATEGORIES, true)
                                    ? $body['category'] : 'unisex',
            'description_ar' => trim(isset($body['description_ar'])    ? $body['description_ar']   : ''),
            'description_en' => trim(isset($body['description_en'])    ? $body['description_en']   : ''),
            'price'          => round((float)(isset($body['price'])    ? $body['price']   : 0), 2),
            'price_before'   => !empty($body['price_before'])
                                    ? round((float)$body['price_before'], 2) : null,
            'stock'          => max(0, (int)(isset($body['stock'])     ? $body['stock']   : 0)),
            'image'          => $firstImage,
            'images_arr'     => $imagesArr,
            'is_active'      => isset($body['is_active']) ? (int)(bool)$body['is_active'] : 1,
        ];
    }
}
