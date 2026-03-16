<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/controllers/AuthController.php';

(new AuthController())->handle();