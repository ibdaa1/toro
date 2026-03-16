<?php
// ─────────────────────────────────────────────────────────────
// notification.php — Push / in-app notification helper (stub)
// Replace with Firebase Cloud Messaging, OneSignal, etc.
// ─────────────────────────────────────────────────────────────

/**
 * Send a push notification to a device token.
 *
 * @param string $deviceToken FCM / APNs device token.
 * @param string $title       Notification title.
 * @param string $body        Notification body.
 * @param array  $data        Optional extra data payload.
 * @return bool
 */
function sendPushNotification(string $deviceToken, string $title, string $body, array $data = []): bool {
    // TODO: Integrate Firebase Cloud Messaging
    // POST https://fcm.googleapis.com/fcm/send
    // Headers: Authorization: key=SERVER_KEY, Content-Type: application/json
    // Body: { "to": $deviceToken, "notification": { "title": $title, "body": $body }, "data": $data }

    error_log("[PUSH] To: $deviceToken | Title: $title | Body: $body");
    return false;
}

/**
 * Send an order status update notification to the order's user.
 *
 * @param array  $order  Order record (must contain user_id, id, status).
 * @param string $lang   Language code for the notification.
 */
function notifyOrderStatus(array $order, string $lang = 'ar'): void {
    // Fetch user's device token from DB and call sendPushNotification()
    // This is a stub — implement once device tokens are stored.
    error_log("[NOTIFY] Order #{$order['id']} status changed to {$order['status']}");
}

/**
 * Log an in-app notification to the database (placeholder table).
 *
 * @param int    $userId
 * @param string $type    Notification type (e.g. 'order_update', 'promo').
 * @param string $message Notification message.
 */
function createNotification(int $userId, string $type, string $message): void {
    // TODO: INSERT INTO notifications (user_id, type, message) VALUES (...)
    error_log("[NOTIFICATION] User $userId | Type: $type | Message: $message");
}
