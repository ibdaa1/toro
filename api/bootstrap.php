<?php
// ─────────────────────────────────────────────────────────────
// bootstrap.php — Application bootstrap
// Loaded once at the top of every API entry point.
// Order matters: config → helpers → middleware → i18n init.
// ─────────────────────────────────────────────────────────────

// ── Config ───────────────────────────────────────────────────
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/constants.php';
require_once __DIR__ . '/config/db.php';

// ── Core helpers (no dependencies on each other) ─────────────
require_once __DIR__ . '/helpers/response.php';
require_once __DIR__ . '/helpers/security.php';
require_once __DIR__ . '/helpers/utils.php';
require_once __DIR__ . '/helpers/jwt.php';
require_once __DIR__ . '/helpers/auth_helper.php';

// ── Infrastructure helpers ───────────────────────────────────
require_once __DIR__ . '/helpers/RBAC.php';
require_once __DIR__ . '/helpers/CSRF.php';
require_once __DIR__ . '/helpers/i18n.php';
require_once __DIR__ . '/helpers/mail.php';
require_once __DIR__ . '/helpers/sms.php';
require_once __DIR__ . '/helpers/notification.php';
require_once __DIR__ . '/helpers/upload.php';

// ── Middleware ───────────────────────────────────────────────
require_once __DIR__ . '/middleware/TimezoneMiddleware.php';
require_once __DIR__ . '/middleware/rate_limit.php';
require_once __DIR__ . '/middleware/validator.php';
require_once __DIR__ . '/middleware/auth.php';
require_once __DIR__ . '/middleware/role.php';

// ── Runtime init ─────────────────────────────────────────────

// Apply UAE timezone by default
TimezoneMiddleware::apply();

// Initialise i18n with Arabic as default (can be overridden per request)
I18n::init('ar', __DIR__ . '/lang');
