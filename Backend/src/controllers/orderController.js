import db from "../config/db.js";

export const getOrders = async (req, res) => {
    const { status = "All" } = req.query;
    try {
        let query = "SELECT * FROM orders";
        const queryParams = [];

        if (status !== "All") {
            query += " WHERE status = ?";
            queryParams.push(status);
        }

        query += " ORDER BY id DESC";
        const [rows] = await db.promise().query(query, queryParams);
        
        const data = rows.map(order => ({
            ...order,
            items: typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || [])
        }));

        res.status(200).json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch orders", error: error.message });
    }
};

export const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.promise().query("SELECT * FROM orders WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Order not found" });
        
        const order = rows[0];
        order.items = typeof order.items === 'string' ? JSON.parse(order.items) : (order.items || []);
        
        res.status(200).json(order);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch order", error: error.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { id } = req.params;
    const { status, tracking_number, courier_name, shipped_at, cancellation_reason, cancelled_at } = req.body;
    try {
        await db.promise().query(
            "UPDATE orders SET status = ?, tracking_number = ?, courier_name = ?, shipped_at = ?, cancellation_reason = ?, cancelled_at = ? WHERE id = ?",
            [status, tracking_number || null, courier_name || null, shipped_at || null, cancellation_reason || null, cancelled_at || null, id]
        );
        res.status(200).json({ message: "Order status updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update order status", error: error.message });
    }
};

export const createOrder = async (req, res) => {
    const { customer_name, customer_email, customer_phone, items, total_amount, payment_method, status } = req.body;
    try {
        const itemsJson = JSON.stringify(items || []);
        const [result] = await db.promise().query(
            "INSERT INTO orders (customer_name, customer_email, customer_phone, items, total_amount, payment_method, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [customer_name, customer_email, customer_phone, itemsJson, total_amount, payment_method, status || 'Order Placed']
        );
        res.status(201).json({ message: "Order created successfully", id: result.insertId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create order", error: error.message });
    }
};
