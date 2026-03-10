<?php
// api/test-db-conn.php — JSON health-check for the database connection

header('Content-Type: application/json; charset=utf-8');

$response = array(
    "success" => false,
    "service" => "database"
);

try {
    require_once __DIR__ . '/config/config.php';
    require_once __DIR__ . '/config/db.php';

    if (!function_exists('getDB')) {
        throw new Exception("Database function not available");
    }

    $db = getDB();

    if ($db instanceof mysqli) {
        $result = $db->query("SELECT 1");
        if ($result === false) {
            throw new Exception("Test query failed: " . $db->error);
        }
        $response["success"] = true;
        $response["driver"]  = "mysqli";
        $db->close();
    }

} catch (Exception $e) {
    http_response_code(500);
    $response["error"] = "Database unavailable: " . $e->getMessage();
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);
