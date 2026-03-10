<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/controllers/ProductController.php';

(new ProductController())->handle();
