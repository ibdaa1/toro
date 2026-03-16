<?php
// ─────────────────────────────────────────────────────────────
// sitemap.php — Dynamic XML Sitemap for TORO Boutique
// Generates a sitemap including homepage and product pages.
// ─────────────────────────────────────────────────────────────

header('Content-Type: application/xml; charset=utf-8');
header('X-Robots-Tag: noindex');

define('SITE_URL', 'https://toroboutique.top');

$products = [];

// Try to load products from the database
try {
    require_once __DIR__ . '/api/config/config.php';
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    if (!$conn->connect_error) {
        $conn->set_charset(DB_CHARSET);
        $res = $conn->query(
            "SELECT id, name_en, name_ar, updated_at FROM products WHERE active = 1 ORDER BY id ASC LIMIT 500"
        );
        if ($res) {
            while ($row = $res->fetch_assoc()) {
                $products[] = $row;
            }
        }
        $conn->close();
    }
} catch (Exception $e) {
    // Silently fail — sitemap will still include homepage
}

// Helper: convert product name to SEO-friendly slug
function slugify($text) {
    $text = strtolower(trim($text));
    $text = preg_replace('/[^a-z0-9]+/', '-', $text);
    $text = trim($text, '-');
    return $text ?: 'product';
}

// Build the XML
echo '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"';
echo ' xmlns:xhtml="http://www.w3.org/1999/xhtml">' . "\n";

// ── Homepage ──
echo "  <url>\n";
echo "    <loc>" . SITE_URL . "/</loc>\n";
echo "    <lastmod>" . date('Y-m-d') . "</lastmod>\n";
echo "    <changefreq>daily</changefreq>\n";
echo "    <priority>1.0</priority>\n";
echo "  </url>\n";

// ── Category pages (hash-based navigation) ──
// Note: Categories use JavaScript hash navigation; actual crawlable
// entry point is the homepage which loads all products.

// ── Product pages ──
foreach ($products as $p) {
    $slug   = slugify($p['name_en']);
    $loc    = SITE_URL . '/?product=' . (int)$p['id'] . '&name=' . rawurlencode($slug);
    $lastmod = !empty($p['updated_at']) ? date('Y-m-d', strtotime($p['updated_at'])) : date('Y-m-d');
    echo "  <url>\n";
    echo "    <loc>" . htmlspecialchars($loc, ENT_XML1 | ENT_QUOTES, 'UTF-8') . "</loc>\n";
    echo "    <lastmod>" . $lastmod . "</lastmod>\n";
    echo "    <changefreq>weekly</changefreq>\n";
    echo "    <priority>0.9</priority>\n";
    echo "  </url>\n";
}

echo '</urlset>' . "\n";
