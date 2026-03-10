<?php
// ─────────────────────────────────────────────────────────────
// db.php — Database connection
// Returns a connected mysqli instance.
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/config.php';

function getDB(): mysqli {
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if ($conn->connect_error) {
        http_response_code(500);
        die(json_encode(['ok' => false, 'msg' => 'DB Error'], JSON_UNESCAPED_UNICODE));
    }
    $conn->set_charset(DB_CHARSET);
    return $conn;
}
