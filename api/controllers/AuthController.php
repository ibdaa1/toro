<?php
// ─────────────────────────────────────────────────────────────
// controllers/AuthController.php
// Handles POST /auth.php?action=register|login
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../helpers/jwt.php';
require_once __DIR__ . '/../helpers/security.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../middleware/rate_limit.php';

class AuthController {
    public function handle() {
        $method = reqMethod();
        $action = qStr('action');

        if ($method === 'POST' && $action === 'register') {
            $this->register();
        } elseif ($method === 'POST' && $action === 'login') {
            $this->login();
        } else {
            err('Not found', 404);
        }
    }

    private function register() {
        RateLimitMiddleware::check(10, 60, 'register');

        $body  = getBody();
        $name  = sanitize(isset($body['name'])  ? $body['name']  : '', 100);
        $email = trim(strtolower(isset($body['email']) ? $body['email'] : ''));
        $pass  = isset($body['password']) ? $body['password'] : '';

        if (!$name || !$email || !$pass)       err('جميع الحقول مطلوبة / All fields required');
        if (mb_strlen($name) > 100)             err('الاسم طويل جداً / Name too long');
        if (!isValidEmail($email))              err('البريد الإلكتروني غير صحيح / Invalid email');
        if (strlen($email) > 150)               err('البريد طويل جداً / Email too long');
        if (strlen($pass) < 6)                  err('كلمة المرور 6 أحرف على الأقل / Password min 6 chars');
        if (strlen($pass) > 100)                err('كلمة المرور طويلة جداً / Password too long');

        $db = getDB();
        if (User::emailExists($db, $email)) {
            $db->close();
            err('البريد مسجل مسبقاً / Email already exists');
        }

        $hash = hashPassword($pass);
        $uid  = User::create($db, $name, $email, $hash);
        $db->close();

        if (!$uid) err('Registration failed', 500);

        ok([
            'token' => makeToken($uid),
            'user'  => ['id' => $uid, 'name' => $name, 'email' => $email, 'role' => 'customer'],
        ]);
    }

    private function login() {
        RateLimitMiddleware::check(20, 60, 'login');

        $body  = getBody();
        $email = trim(strtolower(isset($body['email']) ? $body['email'] : ''));
        $pass  = isset($body['password']) ? $body['password'] : '';

        if (!$email || !$pass)      err('أدخل البيانات / Enter credentials');
        if (!isValidEmail($email))  err('بيانات خاطئة / Invalid credentials', 401);

        $db   = getDB();
        $user = User::findByEmail($db, $email);
        $db->close();

        // Constant-time comparison (prevent timing attacks)
        if (!$user || !verifyPassword($pass, $user['password'])) {
            err('بيانات خاطئة / Invalid credentials', 401);
        }
        if (isset($user['is_active']) && (int)$user['is_active'] === 0) {
            err('تم تعطيل هذا الحساب / Account deactivated', 403);
        }

        unset($user['password']);
        ok(['token' => makeToken((int)$user['id']), 'user' => $user]);
    }
}
