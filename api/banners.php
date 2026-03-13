<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/controllers/BannerController.php';

(new BannerController())->handle();
