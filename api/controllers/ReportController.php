<?php
// ─────────────────────────────────────────────────────────────
// controllers/ReportController.php
// Handles GET /reports.php (admin only)
// ─────────────────────────────────────────────────────────────
require_once __DIR__ . '/../helpers/auth_helper.php';
require_once __DIR__ . '/../helpers/response.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/constants.php';

class ReportController {
    public function handle(): void {
        if (reqMethod() !== 'GET') err('Method not allowed', 405);
        authUser(true);
        $this->generate();
    }

    private function generate(): void {
        $db     = getDB();
        $period = qStr('period', '30days');
        if (!in_array($period, REPORT_PERIODS, true)) $period = '30days';

        [$sinceDate, $groupFmt] = $this->dateRange($period);

        $revenueData = $this->revenueByPeriod($db, $groupFmt, $sinceDate);
        $topProducts = $this->topProducts($db, $sinceDate);
        $statusData  = $this->byStatus($db);
        $summary     = $this->summary($db, $sinceDate);

        $db->close();

        ok([
            'period'       => $period,
            'since'        => $sinceDate,
            'revenue'      => $revenueData,
            'top_products' => $topProducts,
            'by_status'    => $statusData,
            'summary'      => $summary,
        ]);
    }

    private function dateRange(string $period): array {
        switch ($period) {
            case '7days':   return [date('Y-m-d', strtotime('-7 days')),  '%Y-%m-%d'];
            case '3months': return [date('Y-m-d', strtotime('-3 months')),'%Y-%m-%d'];
            case 'year':    return [date('Y-m-d', strtotime('-1 year')),  '%Y-%m'];
            default:        return [date('Y-m-d', strtotime('-30 days')), '%Y-%m-%d'];
        }
    }

    private function revenueByPeriod(mysqli $db, string $groupFmt, string $since): array {
        $stmt = $db->prepare(
            "SELECT DATE_FORMAT(created_at, ?) AS period,
                    COUNT(*) AS orders_count,
                    IFNULL(SUM(total), 0) AS revenue
             FROM orders
             WHERE created_at >= ? AND status NOT IN ('cancelled')
             GROUP BY period ORDER BY period ASC"
        );
        if (!$stmt) return [];
        $stmt->bind_param('ss', $groupFmt, $since);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $rows;
    }

    private function topProducts(mysqli $db, string $since): array {
        $stmt = $db->prepare(
            "SELECT p.id, p.name_ar, p.name_en, p.brand,
                    SUM(oi.qty) AS total_sold,
                    SUM(oi.qty * oi.price) AS revenue
             FROM order_items oi
             JOIN orders o   ON oi.order_id  = o.id
             JOIN products p ON oi.product_id = p.id
             WHERE o.created_at >= ? AND o.status NOT IN ('cancelled')
             GROUP BY p.id ORDER BY total_sold DESC LIMIT 10"
        );
        if (!$stmt) return [];
        $stmt->bind_param('s', $since);
        $stmt->execute();
        $rows = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
        $stmt->close();
        return $rows;
    }

    private function byStatus(mysqli $db): array {
        $res = $db->query(
            "SELECT status, COUNT(*) AS count FROM orders GROUP BY status ORDER BY count DESC"
        );
        return $res ? $res->fetch_all(MYSQLI_ASSOC) : [];
    }

    private function summary(mysqli $db, string $since): array {
        $stmt = $db->prepare(
            "SELECT COUNT(*) AS total_orders,
                    IFNULL(SUM(total), 0)  AS total_revenue,
                    IFNULL(AVG(total), 0)  AS avg_order_value
             FROM orders WHERE created_at >= ? AND status NOT IN ('cancelled')"
        );
        if (!$stmt) return ['total_orders' => 0, 'total_revenue' => 0, 'avg_order_value' => 0];
        $stmt->bind_param('s', $since);
        $stmt->execute();
        $row = $stmt->get_result()->fetch_assoc();
        $stmt->close();
        return $row ?? ['total_orders' => 0, 'total_revenue' => 0, 'avg_order_value' => 0];
    }
}
