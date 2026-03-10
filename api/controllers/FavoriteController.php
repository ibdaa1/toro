<?php
// ─────────────────────────────────────────────────────────────
// controllers/FavoriteController.php
// Handles GET/POST/DELETE /favorites.php
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../models/Favorite.php';
require_once __DIR__ . '/../models/Product.php';
require_once __DIR__ . '/../helpers/auth_helper.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/db.php';

class FavoriteController {
    public function handle() {
        $user   = authUser();
        $method = reqMethod();

        switch ($method) {
            case 'GET':    $this->get($user);    break;
            case 'POST':   $this->post($user);   break;
            case 'DELETE': $this->delete($user); break;
            default:       err('Method not allowed', 405);
        }
    }

    private function get($user) {
        $db   = getDB();
        $rows = Favorite::findByUser($db, (int)$user['id']);
        $db->close();
        ok($rows);
    }

    private function post($user) {
        $body      = getBody();
        $productId = (int)(isset($body['product_id']) ? $body['product_id'] : 0);
        if ($productId <= 0) err('product_id required');

        $db = getDB();

        // Verify product exists and is active
        $product = Product::findById($db, $productId);
        if (!$product) { $db->close(); err('Product not found', 404); }

        if (Favorite::exists($db, (int)$user['id'], $productId)) {
            // Already favorited — remove it (toggle)
            Favorite::remove($db, (int)$user['id'], $productId);
            $db->close();
            ok(['action' => 'removed', 'product_id' => $productId]);
        } else {
            $ok = Favorite::add($db, (int)$user['id'], $productId);
            $db->close();
            if (!$ok) err('Failed to add to favorites', 500);
            ok(['action' => 'added', 'product_id' => $productId]);
        }
    }

    private function delete($user) {
        $productId = qInt('product_id');
        if ($productId <= 0) err('product_id required');

        $db = getDB();
        Favorite::remove($db, (int)$user['id'], $productId);
        $db->close();
        ok(['msg' => 'Removed from favorites']);
    }
}
