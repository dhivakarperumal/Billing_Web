import db from "../config/db.js";

export const createOrder = async (req, res) => {
    const connection = await db.promise().getConnection();
    try {
        await connection.beginTransaction();

        const { customer_name, customer_phone, items, total_amount, status } = req.body;

        if (!customer_name || !customer_phone || !items || items.length === 0) {
            return res.status(400).json({ message: "Missing required order fields" });
        }

        // 1. Create the Order
        const [orderResult] = await connection.query(
            "INSERT INTO orders (customer_name, customer_phone, total_amount, items, status) VALUES (?, ?, ?, ?, ?)",
            [customer_name, customer_phone, total_amount, JSON.stringify(items), status || 'Paid']
        );

        // 2. Update Inventory for each item
        for (const item of items) {
            const [productRows] = await connection.query(
                "SELECT total_stock, variants FROM products WHERE id = ?",
                [item.product_id]
            );

            if (productRows.length > 0) {
                const product = productRows[0];
                let currentStock = product.total_stock || 0;
                let variants = [];
                
                try {
                    variants = product.variants ? JSON.parse(product.variants) : [];
                } catch (e) {
                    console.error("Variant Parse Error:", e);
                    variants = [];
                }

                // Decrement overall stock
                const newTotalStock = Math.max(0, currentStock - item.quantity);

                // Decrement variant stock if applicable
                if (item.variant_info) {
                    variants = variants.map(v => {
                        if (v.quantity === item.variant_info.weight && v.unit === item.variant_info.unit) {
                            const vStock = parseInt(v.stock) || 0;
                            return { ...v, stock: Math.max(0, vStock - item.quantity).toString() };
                        }
                        return v;
                    });
                }

                // Update product table
                await connection.query(
                    "UPDATE products SET total_stock = ?, variants = ? WHERE id = ?",
                    [newTotalStock, JSON.stringify(variants), item.product_id]
                );
            }
        }

        await connection.commit();

        res.status(201).json({
            message: "Order created successfully",
            orderId: orderResult.insertId
        });
    } catch (error) {
        await connection.rollback();
        console.error("Order Creation Error:", error);
        res.status(500).json({ message: "Failed to create order", error: error.message });
    } finally {
        connection.release();
    }
};

export const getOrders = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM orders ORDER BY id DESC");
        res.status(200).json(rows);
    } catch (error) {
        console.error("Fetch Orders Error:", error);
        res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
};
