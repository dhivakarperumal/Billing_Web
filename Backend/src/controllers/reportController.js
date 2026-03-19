import db from "../config/db.js";

export const getReportSummary = async (req, res) => {
    try {
        // 1. Total Revenue (from Orders + Invoices combined)
        const [orderRevenueRow] = await db.promise().query(
            "SELECT COALESCE(SUM(total_amount), 0) as total FROM orders WHERE status != 'Cancelled'"
        );
        const [invoiceRevenueRow] = await db.promise().query(
            "SELECT COALESCE(SUM(total_amount), 0) as total FROM invoices WHERE status != 'Cancelled'"
        );

        const retailRevenue = parseFloat(orderRevenueRow[0].total || 0);
        const dealerRevenue = parseFloat(invoiceRevenueRow[0].total || 0);
        const totalRevenue = parseFloat((retailRevenue + dealerRevenue).toFixed(2));

        // 2. Billing (Total transactions — orders + invoices)
        const [orderCountRow] = await db.promise().query("SELECT COUNT(*) as count FROM orders");
        const [invoiceCountRow] = await db.promise().query("SELECT COUNT(*) as count FROM invoices");
        const totalBilling = parseInt(orderCountRow[0].count || 0) + parseInt(invoiceCountRow[0].count || 0);

        // 3. Unique Customers from billing orders
        const [customerRows] = await db.promise().query(
            "SELECT DISTINCT customer_name FROM orders WHERE customer_name IS NOT NULL AND customer_name != ''"
        );
        const totalCustomers = customerRows.length;

        // 4. Product-based distinct categories (real count)
        const [catDistinctRows] = await db.promise().query(
            "SELECT COUNT(DISTINCT category) as count FROM products WHERE category IS NOT NULL AND category != ''"
        );
        const totalCategories = parseInt(catDistinctRows[0].count || 0);

        // 5. Daily Sales — last 30 days (combined retail + dealer)
        const [salesData] = await db.promise().query(`
            SELECT DATE(created_at) as date, ROUND(SUM(total_amount), 2) as total
            FROM (
                SELECT created_at, total_amount FROM orders WHERE status != 'Cancelled'
                UNION ALL
                SELECT created_at, total_amount FROM invoices WHERE status != 'Cancelled'
            ) as combined_sales
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            GROUP BY DATE(created_at)
            ORDER BY DATE(created_at) ASC
        `);

        // 6. Category Performance — product count and summed price per category
        const [categorySales] = await db.promise().query(`
            SELECT 
                category as name,
                COUNT(*) as count,
                ROUND(COALESCE(SUM(offer_price), 0), 2) as total
            FROM products
            WHERE category IS NOT NULL AND category != ''
            GROUP BY category
            ORDER BY total DESC
        `);

        // 7. Top Customers — sorted by spend
        const [topCustomers] = await db.promise().query(`
            SELECT
                customer_name as name,
                ROUND(SUM(total_amount), 2) as total,
                COUNT(*) as billing
            FROM orders
            WHERE customer_name IS NOT NULL AND customer_name != ''
            GROUP BY customer_name, customer_phone
            ORDER BY total DESC
            LIMIT 10
        `);

        res.json({
            stats: {
                totalRevenue,
                totalBilling,
                totalCustomers,
                totalCategories
            },
            sales: salesData.map(s => ({ ...s, total: parseFloat(s.total) })),
            categories: categorySales.map(c => ({ ...c, total: parseFloat(c.total) })),
            customers: topCustomers.map(c => ({ ...c, total: parseFloat(c.total) }))
        });
    } catch (error) {
        console.error("Report Error:", error);
        res.status(500).json({ message: "Failed to generate report data", error: error.message });
    }
};
