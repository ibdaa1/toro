<?php
// test_bootstrap.php

// إظهار الأخطاء أثناء الاختبار فقط
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// محاولة تحميل bootstrap
try {

    require_once __DIR__ . '/bootstrap.php';

    echo "<h2>Bootstrap Loaded Successfully</h2>";
    echo "<pre>";

    echo "Timezone: " . date_default_timezone_get() . PHP_EOL;

    if (class_exists('I18n')) {
        echo "I18n Class: OK" . PHP_EOL;
    } else {
        echo "I18n Class: NOT FOUND" . PHP_EOL;
    }

    if (function_exists('jsonResponse')) {
        echo "Response Helper: OK" . PHP_EOL;
    } else {
        echo "Response Helper: NOT FOUND" . PHP_EOL;
    }

    if (class_exists('RBAC')) {
        echo "RBAC: OK" . PHP_EOL;
    }

    if (class_exists('CSRF')) {
        echo "CSRF: OK" . PHP_EOL;
    }

    echo "Bootstrap execution finished.";
    echo "</pre>";

} catch (Throwable $e) {

    echo "<h2>Bootstrap Error</h2>";
    echo "<pre>";
    echo $e->getMessage() . PHP_EOL;
    echo $e->getFile() . " : " . $e->getLine();
    echo "</pre>";

}