<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/controllers/StockController.php';

(new StockController())->handle();
