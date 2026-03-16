<?php
// ─────────────────────────────────────────────────────────────
// i18n.php — Internationalization helper
// Loads JSON translation files from api/lang/ and provides
// a translate() function for server-side response messages.
// ─────────────────────────────────────────────────────────────

class I18n {
    private static array  $translations = [];
    private static string $currentLang  = 'ar';
    private static string $langDir      = '';

    /**
     * Initialise the i18n system.
     *
     * @param string $lang    Language code ('ar' or 'en').
     * @param string $langDir Absolute path to the lang/ directory.
     */
    public static function init(string $lang = 'ar', string $langDir = ''): void {
        self::$langDir     = $langDir ?: __DIR__ . '/../lang';
        self::$currentLang = $lang;
        self::load($lang);

        // Always have a fallback
        if ($lang !== 'ar') {
            self::load('ar');
        }
    }

    /**
     * Load a language file into the cache.
     */
    private static function load(string $lang): void {
        if (isset(self::$translations[$lang])) return;

        $file = rtrim(self::$langDir, '/') . '/' . $lang . '.json';
        if (!file_exists($file)) {
            self::$translations[$lang] = [];
            return;
        }
        $raw = file_get_contents($file);
        self::$translations[$lang] = $raw ? (json_decode($raw, true) ?? []) : [];
    }

    /**
     * Translate a dot-notation key, e.g. "auth.invalid_email".
     * Falls back to Arabic, then to the key itself.
     *
     * @param string $key   Dot-notation key.
     * @param string $lang  Override language for this call.
     * @param array  $vars  Replacement variables: ['name' => 'Alice'] replaces :name.
     */
    public static function t(string $key, string $lang = '', array $vars = []): string {
        $useLang = $lang ?: self::$currentLang;
        $value   = self::resolve($key, $useLang);

        // Fallback chain: requested lang → Arabic → key itself
        if ($value === null && $useLang !== 'ar') {
            $value = self::resolve($key, 'ar');
        }
        if ($value === null) {
            $value = $key;
        }

        // Variable substitution (:placeholder)
        foreach ($vars as $placeholder => $replacement) {
            $value = str_replace(':' . $placeholder, (string)$replacement, $value);
        }

        return $value;
    }

    /**
     * Resolve a dot-notation key in a loaded language array.
     */
    private static function resolve(string $key, string $lang): ?string {
        self::load($lang);
        $parts = explode('.', $key);
        $node  = self::$translations[$lang] ?? [];
        foreach ($parts as $part) {
            if (!is_array($node) || !array_key_exists($part, $node)) return null;
            $node = $node[$part];
        }
        return is_string($node) ? $node : null;
    }

    /**
     * Return all translations for a language as an associative array.
     */
    public static function all(string $lang = ''): array {
        $useLang = $lang ?: self::$currentLang;
        self::load($useLang);
        return self::$translations[$useLang] ?? [];
    }

    /**
     * Return the currently active language code.
     */
    public static function getLang(): string {
        return self::$currentLang;
    }
}

/**
 * Global shortcut for I18n::t().
 */
function __t(string $key, string $lang = '', array $vars = []): string {
    return I18n::t($key, $lang, $vars);
}
