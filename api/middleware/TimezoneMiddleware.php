<?php
// ─────────────────────────────────────────────────────────────
// middleware/TimezoneMiddleware.php — Timezone middleware
// ─────────────────────────────────────────────────────────────

class TimezoneMiddleware {
    /** Default timezone for the TORO store (UAE) */
    // No visibility modifier — compatible with PHP 7.0
    const DEFAULT_TZ = 'Asia/Dubai';

    /**
     * Apply the timezone for the current request.
     */
    public static function apply($timezone = self::DEFAULT_TZ) {
        if (!self::isValid($timezone)) {
            $timezone = self::DEFAULT_TZ;
        }
        date_default_timezone_set($timezone);
    }

    /**
     * Apply timezone from a request parameter or fall back to default.
     */
    public static function applyFromRequest() {
        $tz = trim(isset($_GET['tz']) ? $_GET['tz'] : '');
        if ($tz === '' || !self::isValid($tz)) {
            $tz = self::DEFAULT_TZ;
        }
        date_default_timezone_set($tz);
    }

    /**
     * Check whether a timezone identifier is valid.
     */
    public static function isValid($timezone) {
        return in_array($timezone, timezone_identifiers_list(), true);
    }

    /**
     * Return the current server timezone string.
     */
    public static function current() {
        return date_default_timezone_get();
    }

    /**
     * Format a UTC timestamp as a localised datetime string.
     */
    public static function format($utcDatetime, $timezone = self::DEFAULT_TZ, $format = 'Y-m-d H:i:s') {
        try {
            $dt = new DateTime($utcDatetime, new DateTimeZone('UTC'));
            $dt->setTimezone(new DateTimeZone($timezone));
            return $dt->format($format);
        } catch (Exception $e) {
            return $utcDatetime;
        }
    }
}
