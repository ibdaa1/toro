<?php
// api/health/db.php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

$response = [
    "success" => false,
    "service" => "database"
];

try {

    require_once __DIR__ . '/../config/db.php';

    if (!function_exists('connectDB')) {
        throw new Exception("Database function not available");
    }

    $db = connectDB();

    if ($db instanceof mysqli) {

        if ($db->connect_errno) {
            throw new Exception("Database connection failed");
        }

        $db->query("SELECT 1");

        $response["success"] = true;
        $response["driver"] = "mysqli";
    }

    elseif ($db instanceof PDO) {

        $db->query("SELECT 1");

        $response["success"] = true;
        $response["driver"] = "pdo";
    }

} catch (Throwable $e) {

    http_response_code(500);

    $response["error"] = "Database unavailable";

}

echo json_encode($response, JSON_UNESCAPED_UNICODE);