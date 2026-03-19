import db from "../config/db.js";

export const getDealers = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM dealers ORDER BY created_at DESC");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch dealers", error: error.message });
    }
};

export const createDealer = async (req, res) => {
    const { name, contact, email, phone, location, status, rating, orders, image } = req.body;
    try {
        const [result] = await db.promise().query(
            "INSERT INTO dealers (name, contact, email, phone, location, status, rating, orders, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [name, contact, email, phone, location, status || 'Pending', rating || 4.5, orders || 0, image || null]
        );
        res.status(201).json({ message: "Dealer created successfully", id: result.insertId });
    } catch (error) {
        res.status(500).json({ message: "Failed to create dealer", error: error.message });
    }
};

export const updateDealer = async (req, res) => {
    const { id } = req.params;
    const { name, contact, email, phone, location, status, rating, orders, image } = req.body;
    try {
        await db.promise().query(
            "UPDATE dealers SET name = ?, contact = ?, email = ?, phone = ?, location = ?, status = ?, rating = ?, orders = ?, image = ? WHERE id = ?",
            [name, contact, email, phone, location, status, rating, orders, image, id]
        );
        res.json({ message: "Dealer updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update dealer", error: error.message });
    }
};

export const deleteDealer = async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query("DELETE FROM dealers WHERE id = ?", [id]);
        res.json({ message: "Dealer deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete dealer", error: error.message });
    }
};
