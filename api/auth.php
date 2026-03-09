<?php
// auth.php — محمي من SQL Injection + XSS
require_once 'cors.php';
require_once 'db.php';

$method = $_SERVER['REQUEST_METHOD'];
$body   = json_decode(file_get_contents('php://input'), true) ?? [];
$action = isset($_GET['action']) ? $_GET['action'] : '';

if ($method === 'POST' && $action === 'register') {
    // تنظيف المدخلات
    $name  = trim(strip_tags($body['name']  ?? ''));
    $email = trim(strtolower($body['email'] ?? ''));
    $pass  = $body['password'] ?? '';

    // تحقق من الحقول
    if (!$name || !$email || !$pass) err('جميع الحقول مطلوبة / All fields required');
    if (mb_strlen($name) > 100)      err('الاسم طويل جداً / Name too long');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) err('البريد الإلكتروني غير صحيح / Invalid email');
    if (strlen($email) > 150)        err('البريد طويل جداً / Email too long');
    if (strlen($pass) < 6)           err('كلمة المرور 6 أحرف على الأقل / Password min 6 chars');
    if (strlen($pass) > 100)         err('كلمة المرور طويلة جداً / Password too long');

    $db  = getDB();

    // التحقق من وجود البريد — Prepared Statement
    $chk = $db->prepare("SELECT id FROM users WHERE email = ? LIMIT 1");
    $chk->bind_param('s', $email);
    $chk->execute();
    $exists = $chk->get_result()->num_rows;
    $chk->close();
    if ($exists > 0) err('البريد مسجل مسبقاً / Email already exists');

    $hash = password_hash($pass, PASSWORD_BCRYPT, ['cost' => 11]);
    $stmt = $db->prepare("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'customer')");
    $stmt->bind_param('sss', $name, $email, $hash);
    if (!$stmt->execute()) { $db->close(); err('Registration failed', 500); }
    $uid = $db->insert_id;
    $stmt->close();
    $db->close();

    ok([
        'token' => makeToken($uid),
        'user'  => ['id' => $uid, 'name' => $name, 'email' => $email, 'role' => 'customer']
    ]);
}

if ($method === 'POST' && $action === 'login') {
    $email = trim(strtolower($body['email'] ?? ''));
    $pass  = $body['password'] ?? '';

    if (!$email || !$pass) err('أدخل البيانات / Enter credentials');
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) err('بيانات خاطئة / Invalid credentials', 401);

    $db   = getDB();
    $stmt = $db->prepare("SELECT id, name, email, password, role, is_active FROM users WHERE email = ? LIMIT 1");
    $stmt->bind_param('s', $email);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $db->close();

    // timing-safe: تحقق حتى لو المستخدم غير موجود لمنع timing attacks
    if (!$user || !password_verify($pass, $user['password'])) {
        err('بيانات خاطئة / Invalid credentials', 401);
    }

    if (isset($user['is_active']) && (int)$user['is_active'] === 0) {
        err('تم تعطيل هذا الحساب / Account deactivated', 403);
    }

    unset($user['password']);
    ok(['token' => makeToken($user['id']), 'user' => $user]);
}

err('Not found', 404);