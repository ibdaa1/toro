<?php
// Catch fatal PHP errors (missing file, class not found, etc.) and return JSON.
// register_shutdown_function fires even for errors that bypass try/catch.
register_shutdown_function(function () {
    $e = error_get_last();
    if ($e && ($e['type'] & (E_ERROR | E_PARSE | E_COMPILE_ERROR | E_CORE_ERROR))) {
        if (!headers_sent()) {
            http_response_code(500);
            header('Content-Type: application/json; charset=utf-8');
        }
        // Only the file basename is exposed (no full path) to limit information leakage.
        echo json_encode(
            ['ok' => false, 'msg' => basename($e['file']) . ':' . $e['line'] . ': ' . $e['message']],
            JSON_UNESCAPED_UNICODE
        );
    }
});

try {
    require_once __DIR__ . '/bootstrap.php';
    require_once __DIR__ . '/controllers/FavoriteController.php';
    (new FavoriteController())->handle();
} catch (Throwable $e) {
    // Throwable catches both Exception and Error (PHP 7.0+).
    if (!headers_sent()) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
    }
    echo json_encode(['ok' => false, 'msg' => $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
