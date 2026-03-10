<?php
require_once __DIR__ . '/bootstrap.php';

$db = getDB();

$tables = "
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(100) NOT NULL,
  `email`      VARCHAR(150) NOT NULL UNIQUE,
  `password`   VARCHAR(255) NOT NULL,
  `role`       ENUM('admin','customer') DEFAULT 'customer',
  `is_active`  TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `products` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `name_ar`        VARCHAR(200) NOT NULL,
  `name_en`        VARCHAR(200) NOT NULL,
  `brand`          VARCHAR(100) NOT NULL,
  `origin`         VARCHAR(100) DEFAULT '',
  `category`       VARCHAR(50)  DEFAULT 'unisex',
  `description_ar` TEXT,
  `description_en` TEXT,
  `price`          DECIMAL(10,2) NOT NULL,
  `price_before`   DECIMAL(10,2) DEFAULT NULL,
  `stock`          INT DEFAULT 0,
  `image`          VARCHAR(500) DEFAULT '',
  `is_active`      TINYINT(1) DEFAULT 1,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `orders` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`    INT NOT NULL,
  `total`      DECIMAL(10,2) NOT NULL,
  `status`     ENUM('pending','confirmed','shipped','delivered','cancelled') DEFAULT 'pending',
  `address`    TEXT,
  `notes`      TEXT,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `order_items` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `order_id`   INT NOT NULL,
  `product_id` INT NOT NULL,
  `qty`        INT NOT NULL DEFAULT 1,
  `price`      DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (`order_id`)   REFERENCES `orders`(`id`)   ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `payments` (
  `id`             INT AUTO_INCREMENT PRIMARY KEY,
  `order_id`       INT NOT NULL,
  `user_id`        INT NOT NULL,
  `amount`         DECIMAL(10,2) NOT NULL,
  `method`         ENUM('cod','card','bank_transfer','scheduled') DEFAULT 'cod',
  `status`         ENUM('pending','paid','failed','refunded') DEFAULT 'pending',
  `scheduled_date` DATE DEFAULT NULL,
  `reference`      VARCHAR(100) DEFAULT NULL COMMENT 'رقم مرجعي للدفع',
  `notes`          TEXT,
  `created_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`     TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`)  REFERENCES `users`(`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `favorites` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `user_id`    INT NOT NULL,
  `product_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY `uq_fav` (`user_id`, `product_id`),
  FOREIGN KEY (`user_id`)    REFERENCES `users`(`id`)    ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `stock_movements` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `product_id`  INT NOT NULL,
  `type`        ENUM('in','out','adjustment') DEFAULT 'in',
  `quantity`    INT NOT NULL,
  `balance`     INT NOT NULL COMMENT 'stock level after movement',
  `reason`      VARCHAR(255) DEFAULT '',
  `user_id`     INT DEFAULT NULL,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`)    REFERENCES `users`(`id`)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
";

// Run each statement
$stmts = array_filter(array_map('trim', explode(';', $tables)));
$results = [];
foreach ($stmts as $sql) {
    if (empty($sql)) continue;
    if ($db->query($sql)) {
        $results[] = ['sql' => substr($sql, 0, 50).'...', 'status' => 'OK'];
    } else {
        $results[] = ['sql' => substr($sql, 0, 50).'...', 'status' => 'Error: '.$db->error];
    }
}

// Migration: add is_active to users if it doesn't exist
$colCheck = $db->query("SHOW COLUMNS FROM `users` LIKE 'is_active'");
if ($colCheck && $colCheck->num_rows === 0) {
    if ($db->query("ALTER TABLE `users` ADD COLUMN `is_active` TINYINT(1) NOT NULL DEFAULT 1 AFTER `role`")) {
        $results[] = ['migration' => 'Added is_active column to users'];
    } else {
        $results[] = ['migration' => 'Failed to add is_active: ' . $db->error];
    }
}

// Insert admin if not exists
$check = $db->query("SELECT id FROM users WHERE email='admin@toro.ae'");
if ($check->num_rows === 0) {
    $hash = password_hash('admin123', PASSWORD_BCRYPT);
    $db->query("INSERT INTO users (name,email,password,role) VALUES ('Admin TORO','admin@toro.ae','$hash','admin')");
    $results[] = ['action' => 'Admin user created', 'email' => 'admin@toro.ae', 'password' => 'admin123'];
} else {
    $results[] = ['action' => 'Admin already exists'];
}

// Insert sample products if empty
$pcheck = $db->query("SELECT COUNT(*) as c FROM products");
$prow = $pcheck->fetch_assoc();
if ($prow['c'] == 0) {
    $samples = [
        ["عود الملكي","Royal Oud","Creed","France","men","عطر عود فاخر برائحة خشبية غنية","Luxurious oud fragrance with rich woody notes",450,550,10,"https://images.unsplash.com/photo-1541643600914-78b084683702?w=400"],
        ["روز دو باريس","Rose de Paris","Chanel","France","women","رائحة وردية ناعمة مستوحاة من باريس","Soft floral rose scent inspired by Paris",380,null,15,"https://images.unsplash.com/photo-1588514912908-53a8b1010e6a?w=400"],
        ["أوريانتال نايت","Oriental Night","TORO","UAE","unisex","عطر شرقي دافئ يجمع العنبر والمسك","Warm oriental blend of amber and musk",290,350,8,"https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400"],
        ["مسك الخالص","Pure Musk","Lattafa","UAE","unisex","مسك نقي لأناقة يومية","Pure clean musk for everyday elegance",180,null,20,"https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400"],
        ["جاسمين دريم","Jasmine Dream","YSL","France","women","مزيج الياسمين والفانيليا الفاخر","Luxurious jasmine and vanilla blend",520,600,5,"https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400"],
    ];
    foreach ($samples as $p) {
        $price_before = $p[8] ? "'".$p[8]."'" : "NULL";
        $db->query("INSERT INTO products (name_ar,name_en,brand,origin,category,description_ar,description_en,price,price_before,stock,image) VALUES ('{$p[0]}','{$p[1]}','{$p[2]}','{$p[3]}','{$p[4]}','{$p[5]}','{$p[6]}',{$p[7]},$price_before,{$p[9]},'{$p[10]}')");
    }
    $results[] = ['action' => '5 sample products inserted'];
}

$db->close();
ok(['message' => 'Setup complete!', 'results' => $results]);
