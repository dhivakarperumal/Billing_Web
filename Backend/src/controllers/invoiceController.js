import db from "../config/db.js";

export const createInvoice = async (req, res) => {
    const { dealer_id, invoice_date, total_amount, status, items } = req.body;
    let connection;
    try {
        connection = await db.promise().getConnection();
        await connection.beginTransaction();

        // 1. Insert Invoice
        const [invoiceResult] = await connection.query(
            "INSERT INTO invoices (dealer_id, invoice_date, total_amount, status) VALUES (?, ?, ?, ?)",
            [dealer_id, invoice_date, total_amount, status || 'Pending']
        );
        const invoiceId = invoiceResult.insertId;

        // 2. Insert Invoice Items
        if (items && items.length > 0) {
            const itemQueries = items.map(item => [
                invoiceId,
                item.product_id,
                item.name,
                item.price,
                item.quantity,
                item.total
            ]);
            await connection.query(
                "INSERT INTO invoice_items (invoice_id, product_id, name, price, quantity, total) VALUES ?",
                [itemQueries]
            );
        }

        // 3. Update Dealer Orders count
        await connection.query(
            "UPDATE dealers SET orders = orders + 1 WHERE id = ?",
            [dealer_id]
        );

        await connection.commit();
        res.status(201).json({ message: "Invoice created successfully", invoiceId });
    } catch (error) {
        if (connection) await connection.rollback();
        console.error("Create Invoice Error:", error);
        res.status(500).json({ message: "Failed to create invoice", error: error.message });
    } finally {
        if (connection) connection.release();
    }
};

export const getDealerInvoices = async (req, res) => {
    const { dealerId } = req.params;
    try {
        const [rows] = await db.promise().query(
            "SELECT * FROM invoices WHERE dealer_id = ? ORDER BY invoice_date DESC",
            [dealerId]
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch invoices", error: error.message });
    }
};

export const getInvoiceDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const [invoice] = await db.promise().query("SELECT i.*, d.name as dealer_name, d.email as dealer_email, d.phone as dealer_phone FROM invoices i JOIN dealers d ON i.dealer_id = d.id WHERE i.id = ?", [id]);
        if (invoice.length === 0) return res.status(404).json({ message: "Invoice not found" });

        const [items] = await db.promise().query("SELECT * FROM invoice_items WHERE invoice_id = ?", [id]);
        
        res.json({
            ...invoice[0],
            items
        });
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch invoice details", error: error.message });
    }
};

export const getAllInvoices = async (req, res) => {
    try {
        const [rows] = await db.promise().query(
            "SELECT i.*, d.name as dealer_name FROM invoices i JOIN dealers d ON i.dealer_id = d.id ORDER BY i.created_at DESC"
        );
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch all invoices", error: error.message });
    }
};
