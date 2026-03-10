<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/controllers/UserController.php';

(new UserController())->handle();
