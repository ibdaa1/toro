<?php
// ─────────────────────────────────────────────────────────────
// middleware/TimezoneMiddleware.php — Timezone middleware
// Ensures all date/time operations use the configured timezone.
// ─────────────────────────────────────────────────────────────

class TimezoneMiddleware {
    /** Default timezone for the TORO store (UAE) */
    public const DEFAULT_TZ = 'Asia/Dubai';

    /**
     * Apply the timezone for the current request.
     *
     * @param string $timezone  PHP timezone identifier (default: Asia/Dubai).
     */
    public static function apply(string $timezone = self::DEFAULT_TZ): void {
        if (!self::isValid($timezone)) {
            $timezone = self::DEFAULT_TZ;
        }
        date_default_timezone_set($timezone);
    }

    /**
     * Apply timezone from a request parameter or fall back to default.
     * Clients may send ?tz=Asia/Riyadh to get localised timestamps.
     */
    public static function applyFromRequest(): void {
        $tz = trim($_GET['tz'] ?? '');
        if ($tz === '' || !self::isValid($tz)) {
            $tz = self::DEFAULT_TZ;
        }
        date_default_timezone_set($tz);
    }

    /**
     * Check whether a timezone identifier is valid.
     */
    public static function isValid(string $timezone): bool {
        return in_array($timezone, timezone_identifiers_list(), true);
    }

    /**
     * Return the current server timezone string.
     */
    public static function current(): string {
        return date_default_timezone_get();
    }

    /**
     * Format a UTC timestamp as a localised datetime string.
     *
     * @param string $utcDatetime  MySQL UTC datetime string.
     * @param string $timezone     Target timezone.
     * @param string $format       PHP date format.
     */
    public static function format(
        string $utcDatetime,
        string $timezone = self::DEFAULT_TZ,
        string $format   = 'Y-m-d H:i:s'
    ): string {
        try {
            $dt = new DateTime($utcDatetime, new DateTimeZone('UTC'));
            $dt->setTimezone(new DateTimeZone($timezone));
            return $dt->format($format);
        } catch (Exception $e) {
            return $utcDatetime;
        }
    }
}
