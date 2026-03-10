<?php
// ─────────────────────────────────────────────────────────────
// constants.php — Application-wide constants
// ─────────────────────────────────────────────────────────────

// User roles
define('ROLE_ADMIN',    'admin');
define('ROLE_CUSTOMER', 'customer');
define('USER_ROLES',    [ROLE_ADMIN, ROLE_CUSTOMER]);

// Order statuses
define('ORDER_STATUSES', ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled']);

// Payment methods
define('PAYMENT_METHODS', ['cod', 'card', 'bank_transfer', 'scheduled']);

// Payment statuses
define('PAYMENT_STATUSES', ['pending', 'paid', 'failed', 'refunded']);

// Product categories
define('PRODUCT_CATEGORIES', ['men', 'women', 'unisex']);

// Allowed image MIME types for uploads
define('ALLOWED_IMAGE_MIMES', ['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

// MIME-to-extension map
define('IMAGE_EXT_MAP', [
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
    'image/gif'  => 'gif',
]);

// Pagination defaults
define('DEFAULT_PAGE_LIMIT',  50);
define('MAX_PAGE_LIMIT',     100);

// Stock movement types
define('STOCK_TYPES', ['in', 'out', 'adjustment']);

// Report periods
define('REPORT_PERIODS', ['7days', '30days', '3months', 'year']);
