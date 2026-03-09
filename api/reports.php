<?php
// reports.php — Sales reports and analytics data
require_once 'cors.php';
require_once 'db.php';

authUser(true);

$db     = getDB();
$period = in_array($_GET['period'] ?? '', ['7days','30days','3months','year'], true)
          ? $_GET['period'] : '30days';

// ── Date range ────────────────────────────────────────────
switch ($period) {
    case '7days':   $sinceDate = date('Y-m-d', strtotime('-7 days'));  $groupFmt = '%Y-%m-%d'; break;
    case '3months': $sinceDate = date('Y-m-d', strtotime('-3 months')); $groupFmt = '%Y-%m-%d'; break;
    case 'year':    $sinceDate = date('Y-m-d', strtotime('-1 year'));   $groupFmt = '%Y-%m'; break;
    default:        $sinceDate = date('Y-m-d', strtotime('-30 days'));  $groupFmt = '%Y-%m-%d'; break;
}

$revenueData = [];
$topProducts = [];
$statusData  = [];
$summary     = ['total_orders' => 0, 'total_revenue' => 0, 'avg_order_value' => 0];

// ── 1. Daily / monthly revenue ────────────────────────────
$stmt = $db->prepare(
    "SELECT DATE_FORMAT(created_at, ?) AS period,
            COUNT(*) AS orders_count,
            IFNULL(SUM(total), 0) AS revenue
     FROM orders
     WHERE created_at >= ? AND status NOT IN ('cancelled')
     GROUP BY period
     ORDER BY period ASC"
);
if ($stmt) {
    $stmt->bind_param('ss', $groupFmt, $sinceDate);
    $stmt->execute();
    $revenueData = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt->close();
}

// ── 2. Top selling products ────────────────────────────────
$stmt2 = $db->prepare(
    "SELECT p.id, p.name_ar, p.name_en, p.brand,
            SUM(oi.qty)   AS total_sold,
            SUM(oi.qty * oi.price) AS revenue
     FROM order_items oi
     JOIN orders o  ON oi.order_id  = o.id
     JOIN products p ON oi.product_id = p.id
     WHERE o.created_at >= ? AND o.status NOT IN ('cancelled')
     GROUP BY p.id
     ORDER BY total_sold DESC
     LIMIT 10"
);
if ($stmt2) {
    $stmt2->bind_param('s', $sinceDate);
    $stmt2->execute();
    $topProducts = $stmt2->get_result()->fetch_all(MYSQLI_ASSOC);
    $stmt2->close();
}

// ── 3. Orders by status ────────────────────────────────────
$statusRes = $db->query(
    "SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY count DESC"
);
if ($statusRes) {
    $statusData = $statusRes->fetch_all(MYSQLI_ASSOC);
}

// ── 4. Summary totals ──────────────────────────────────────
$stmt3 = $db->prepare(
    "SELECT COUNT(*) AS total_orders,
            IFNULL(SUM(total), 0) AS total_revenue,
            IFNULL(AVG(total), 0) AS avg_order_value
     FROM orders WHERE created_at >= ? AND status NOT IN ('cancelled')"
);
if ($stmt3) {
    $stmt3->bind_param('s', $sinceDate);
    $stmt3->execute();
    $row = $stmt3->get_result()->fetch_assoc();
    if ($row) $summary = $row;
    $stmt3->close();
}

$db->close();

ok([
    'period'      => $period,
    'since'       => $sinceDate,
    'revenue'     => $revenueData,
    'top_products'=> $topProducts,
    'by_status'   => $statusData,
    'summary'     => $summary,
]);
