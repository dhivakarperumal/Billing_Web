import db from "../config/db.js";

export const getDashboardData = async (req, res) => {
    try {
        // 1. Basic Stats
        const [revenueRows] = await db.promise().query("SELECT SUM(total_amount) as total FROM orders WHERE status != 'Cancelled'");
        const [orderRows] = await db.promise().query("SELECT COUNT(*) as count FROM orders WHERE status NOT IN ('Delivered', 'Cancelled')");
        const [lowStockRows] = await db.promise().query("SELECT COUNT(*) as count FROM products WHERE total_stock < 10 AND total_stock > 0");
        const [productRows] = await db.promise().query("SELECT COUNT(*) as count FROM products");

        const totalRevenue = revenueRows[0].total || 0;
        const activeOrders = orderRows[0].count || 0;
        const lowStockCount = lowStockRows[0].count || 0;
        const totalProducts = productRows[0].count || 0;

        const stats = [
            { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString()}`, trend: "+12.5%", bg: "bg-emerald-50", color: "text-emerald-500" },
            { label: "Active Orders", value: activeOrders.toString(), trend: "+3.2%", bg: "bg-blue-50", color: "text-blue-500" },
            { label: "Low Stock", value: lowStockCount.toString(), trend: "-2.1%", bg: "bg-amber-50", color: "text-amber-500" },
            { label: "Total Products", value: totalProducts.toString(), trend: "+4.4%", bg: "bg-indigo-50", color: "text-indigo-500" }
        ];

        // 2. Recent Orders
        const [recentOrderRows] = await db.promise().query("SELECT * FROM orders ORDER BY id DESC LIMIT 5");
        const recentOrders = recentOrderRows.map(o => ({
            id: `#${o.id}`,
            customer: o.customer_name,
            product: "View Details", // Simplification
            amount: `₹${o.total_amount}`,
            status: o.status,
            date: new Date(o.created_at || Date.now()).toLocaleDateString()
        }));

        // 3. Low Stock Alerts
        const [lowStockAlertRows] = await db.promise().query("SELECT * FROM products WHERE total_stock < 10 AND total_stock > 0 LIMIT 5");
        const lowStockAlerts = lowStockAlertRows.map(p => ({
            name: p.name,
            img: typeof p.images === 'string' ? JSON.parse(p.images)[0] : (p.images?.[0] || ""),
            cat: p.category,
            stock: p.total_stock,
            color: p.total_stock < 5 ? "text-red-500" : "text-amber-500"
        }));

        // 4. Category Analytics
        const [catRows] = await db.promise().query("SELECT category, COUNT(*) as count FROM products GROUP BY category");
        const categoryAnalytics = catRows.map((cat, i) => ({
            name: cat.category,
            items: `${cat.count} Items`,
            rev: "₹0", // Simplification unless we aggregate from orders
            pct: Math.round((cat.count / totalProducts) * 100) || 0,
            color: i % 2 === 0 ? "bg-primary" : "bg-indigo-400"
        }));

        // 5. Mocked or Simplified placeholders for remaining fields
        const topProducts = []; // Would require parsing order items JSON
        const revenueTrends = [
            { month: 'Jan', revenue: 0 },
            { month: 'Feb', revenue: 0 },
            { month: 'Mar', revenue: totalRevenue }
        ];
        const regionalSales = [];

        res.status(200).json({
            stats,
            recentOrders,
            topProducts,
            lowStockAlerts,
            categoryAnalytics,
            revenueTrends,
            regionalSales
        });
    } catch (error) {
        console.error("Dashboard calculation error:", error);
        res.status(500).json({ message: "Failed to generate dashboard data", error: error.message });
    }
};
