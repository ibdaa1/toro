<?php
// ─────────────────────────────────────────────────────────────
// notification.php — Push / in-app notification helper (stub)
// ─────────────────────────────────────────────────────────────

/**
 * Send a push notification to a device token.
 */
function sendPushNotification($deviceToken, $title, $body, $data = []) {
    error_log("[PUSH] To: $deviceToken | Title: $title | Body: $body");
    return false;
}

/**
 * Send an order status update notification to the order's user.
 */
function notifyOrderStatus($order, $lang = 'ar') {
    error_log("[NOTIFY] Order #{$order['id']} status changed to {$order['status']}");
}

/**
 * Log an in-app notification to the database (placeholder table).
 */
function createNotification($userId, $type, $message) {
    error_log("[NOTIFICATION] User $userId | Type: $type | Message: $message");
}
