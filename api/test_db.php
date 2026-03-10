<?php
// api/test_db.php — quick DB connectivity test
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/db.php';

$conn = getDB();

// استعلام لجلب الوقت الحالي
$sql    = "SELECT NOW() AS `current_time`";
$result = $conn->query($sql);

if ($result) {
    $row = $result->fetch_assoc();
    echo "تم الاتصال بقاعدة البيانات بنجاح! الوقت الحالي: " . $row['current_time'];
} else {
    echo "حدث خطأ في الاستعلام: " . $conn->error;
}

$conn->close();
