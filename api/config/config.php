<?php
// ─────────────────────────────────────────────────────────────
// config.php — Project configuration
// ─────────────────────────────────────────────────────────────

// Database
define('DB_HOST',     'sql311.infinityfree.com');
define('DB_USER',     'if0_39652926');
define('DB_PASS',     'Mohd28332');
define('DB_NAME',     'if0_39652926_toro');
define('DB_CHARSET',  'utf8mb4');

// Application
define('APP_NAME',    'TORO Store');
define('APP_VERSION', '2.0');
define('APP_LOCALE',  'ar');          // default language

// Base URL for generating uploaded-file URLs.
// Set to the public root of your site to avoid relying on the Host header.
// Example: define('APP_BASE_URL', 'https://toroboutique.top');
define('APP_BASE_URL',   'https://toroboutique.top');

// From address used for outgoing emails
define('APP_MAIL_FROM',  'noreply@toro.ae');

// Security
define('TOKEN_EXPIRY',     86400);    // 24 hours in seconds
define('BCRYPT_COST',      11);

// File uploads
define('UPLOAD_MAX_SIZE',  5 * 1024 * 1024);  // 5 MB
define('UPLOAD_DIR',       dirname(__DIR__, 2) . '/uploads/');
define('UPLOAD_URL_PATH',  '/uploads/');

// Revenue target for progress bar (AED)
define('REVENUE_TARGET', 100000);
