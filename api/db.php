<?php
// db.php — حل نهائي لـ InfinityFree
// المشكلة: InfinityFree يحجب Authorization وأحياناً Custom headers
// الحل: قراءة التوكن من كل المصادر الممكنة بالترتيب

function getDB() {
    $conn = new mysqli("sql311.infinityfree.com", "if0_39652926", "Mohd28332", "if0_39652926_toro");
    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode(['ok' => false, 'msg' => 'DB Error']));
    }
    $conn->set_charset("utf8mb4");
    return $conn;
}

function ok($data = []) {
    echo json_encode(['ok' => true, 'data' => $data], JSON_UNESCAPED_UNICODE);
    exit;
}

function err($msg, $code = 400) {
    http_response_code($code);
    echo json_encode(['ok' => false, 'msg' => $msg], JSON_UNESCAPED_UNICODE);
    exit;
}

function getToken() {
    // ══ 1. X-Token custom header (عبر .htaccess) ══
    if (!empty($_SERVER['HTTP_X_TOKEN'])) {
        return trim($_SERVER['HTTP_X_TOKEN']);
    }

    // ══ 2. Authorization Bearer header ══
    foreach (['HTTP_AUTHORIZATION', 'REDIRECT_HTTP_AUTHORIZATION', 'HTTP_X_AUTHORIZATION'] as $k) {
        if (!empty($_SERVER[$k])) {
            $v = $_SERVER[$k];
            if (preg_match('/Bearer\s+(\S+)/i', $v, $m)) return $m[1];
            // ربما يصل بدون "Bearer"
            if (strlen(trim($v)) > 10) return trim($v);
        }
    }

    // ══ 3. getallheaders() / apache_request_headers() ══
    $hdrFuncs = ['getallheaders', 'apache_request_headers'];
    foreach ($hdrFuncs as $fn) {
        if (function_exists($fn)) {
            $hdrs = array_change_key_case($fn(), CASE_LOWER);
            if (!empty($hdrs['x-token'])) return trim($hdrs['x-token']);
            if (!empty($hdrs['authorization'])) {
                $v = $hdrs['authorization'];
                if (preg_match('/Bearer\s+(\S+)/i', $v, $m)) return $m[1];
                if (strlen(trim($v)) > 10) return trim($v);
            }
        }
    }

    // ══ 4. Body JSON (_token) — الفولباك الأكثر موثوقية على InfinityFree ══
    $rawBody = file_get_contents('php://input');
    if ($rawBody) {
        $body = json_decode($rawBody, true);
        if (!empty($body['_token'])) return trim($body['_token']);
    }

    // ══ 5. Query string _token (للـ GET/DELETE) ══
    if (!empty($_GET['_token'])) return trim($_GET['_token']);

    return null;
}

function makeToken($userId) {
    $payload = json_encode(['id' => (int)$userId, 'ts' => time()]);
    return rtrim(strtr(base64_encode($payload), '+/', '-_'), '=');
}

function decodeToken($token) {
    // دعم base64url و base64 عادي
    $b64 = strtr(trim($token), '-_', '+/');
    $pad = strlen($b64) % 4;
    if ($pad) $b64 .= str_repeat('=', 4 - $pad);
    $raw = base64_decode($b64, true);
    if ($raw === false) return null;
    $data = json_decode($raw, true);
    if (!is_array($data) || empty($data['id']) || !isset($data['ts'])) return null;
    return $data;
}

function authUser($requireAdmin = false) {
    $token = getToken();
    if (!$token) {
        // للتشخيص: أرسل رسالة توضح أين البحث فشل
        err('Unauthorized - token not found in headers/body/query', 401);
    }

    $data = decodeToken($token);
    if (!$data) err('Invalid token format', 401);

    if ((time() - (int)$data['ts']) > 86400) {
        err('Session expired - please login again', 401);
    }

    $userId = (int)$data['id'];
    if ($userId <= 0) err('Invalid user id in token', 401);

    $db   = getDB();
    $stmt = $db->prepare("SELECT id, name, email, role FROM users WHERE id = ? LIMIT 1");
    if (!$stmt) { $db->close(); err('DB prepare error: '.$db->error, 500); }
    $stmt->bind_param('i', $userId);
    $stmt->execute();
    $user = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    $db->close();

    if (!$user) err('User not found', 401);
    if ($requireAdmin && $user['role'] !== 'admin') err('Admin only - requires admin role', 403);

    return $user;
}