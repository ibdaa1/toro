<?php
require_once __DIR__ . '/bootstrap.php';
require_once __DIR__ . '/controllers/FavoriteController.php';

(new FavoriteController())->handle();
