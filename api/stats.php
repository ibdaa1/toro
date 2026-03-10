<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/controllers/StatsController.php';

(new StatsController())->handle();
