<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/controllers/UploadController.php';

(new UploadController())->handle();
