<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/controllers/PaymentController.php';

(new PaymentController())->handle();
