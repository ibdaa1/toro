<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/controllers/ReportController.php';

(new ReportController())->handle();
