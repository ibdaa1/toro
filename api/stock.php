<?php
try {
    require_once __DIR__ . '/bootstrap.php';
    require_once __DIR__ . '/controllers/StockController.php';
    (new StockController())->handle();
} catch (Throwable $e) {
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode(['ok' => false, 'msg' => 'Server error'], JSON_UNESCAPED_UNICODE);
}
