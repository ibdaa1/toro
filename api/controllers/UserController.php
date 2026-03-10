<?php
// ─────────────────────────────────────────────────────────────
// controllers/UserController.php
// Handles GET/PUT /users.php (admin only)
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../helpers/auth_helper.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/db.php';

class UserController {
    public function handle(): void {
        $method = reqMethod();
        $id     = qInt('id') ?: null;

        authUser(true); // admin only for all user management

        switch ($method) {
            case 'GET': $this->get();       break;
            case 'PUT': $this->put($id);    break;
            default:    err('Method not allowed', 405);
        }
    }

    private function get(): void {
        $db   = getDB();
        $rows = User::findAll($db);
        $db->close();
        ok($rows);
    }

    private function put(?int $id): void {
        if (!$id) err('ID required', 400);
        $body      = getBody();
        $newActive = isset($body['is_active']) ? (int)(bool)$body['is_active'] : null;
        if ($newActive === null) err('is_active required');

        $db = getDB();

        // Prevent deactivating the last active admin
        if ($newActive === 0) {
            $remaining = User::countActiveAdminsExcluding($db, $id);
            if ($remaining === 0) {
                $db->close();
                err('لا يمكن تعطيل آخر حساب مدير / Cannot deactivate the last admin');
            }
        }

        $ok = User::setActive($db, $id, $newActive);
        $db->close();

        if (!$ok) err('Update failed', 500);
        ok(['msg' => $newActive ? 'User activated' : 'User deactivated']);
    }
}
