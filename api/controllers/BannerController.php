<?php
// ─────────────────────────────────────────────────────────────
// controllers/BannerController.php
// GET    /api/banners.php        — public list (active only)
// GET    /api/banners.php?admin=1 — admin list (all)
// POST   /api/banners.php        — create   (admin)
// PUT    /api/banners.php?id=N   — update   (admin)
// DELETE /api/banners.php?id=N   — delete   (admin)
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../models/Banner.php';
require_once __DIR__ . '/../helpers/auth_helper.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/db.php';

class BannerController {
    public function handle() {
        $method = reqMethod();
        $id     = qInt('id') ?: null;

        switch ($method) {
            case 'GET':    $this->get();         break;
            case 'POST':   $this->post();        break;
            case 'PUT':    $this->put($id);      break;
            case 'DELETE': $this->delete($id);   break;
            default:       err('Method not allowed', 405);
        }
    }

    private function get() {
        $db = getDB();
        $adminMode = false;
        if (!empty($_GET['admin'])) {
            authUser(true);
            $adminMode = true;
        }
        $rows = Banner::findAll($db, $adminMode);
        $db->close();
        ok($rows);
    }

    private function post() {
        authUser(true);
        $db   = getDB();
        $data = $this->parseBody();
        if (empty($data['image_url'])) {
            $db->close();
            err('image_url is required');
        }
        $newId = Banner::create($db, $data);
        $db->close();
        if (!$newId) err('Insert failed', 500);
        ok(['id' => $newId, 'msg' => 'Banner created']);
    }

    private function put($id) {
        if (!$id) err('ID required', 400);
        authUser(true);
        $db   = getDB();
        $data = $this->parseBody();
        if (empty($data['image_url'])) {
            $db->close();
            err('image_url is required');
        }
        $ok = Banner::update($db, $id, $data);
        $db->close();
        if (!$ok) err('Update failed', 500);
        ok(['msg' => 'Banner updated']);
    }

    private function delete($id) {
        if (!$id) err('ID required', 400);
        authUser(true);
        $db = getDB();
        Banner::delete($db, $id);
        $db->close();
        ok(['msg' => 'Banner deleted']);
    }

    private function parseBody() {
        $raw = file_get_contents('php://input');
        return $raw ? (json_decode($raw, true) ?? []) : [];
    }
}
