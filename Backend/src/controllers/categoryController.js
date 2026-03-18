import db from "../config/db.js";

// Helper to generate Category ID
const generateCatID = async () => {
    const prefix = "CAT";
    const [rows] = await db.promise().query("SELECT COUNT(*) as count FROM categories");
    const count = (rows[0].count || 0) + 1;
    return `${prefix}${count.toString().padStart(3, '0')}`;
};

export const getCategories = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT * FROM categories ORDER BY id DESC");
        // Parse subcategories if stored as JSON string
        const categories = rows.map(cat => ({
            ...cat,
            subcategories: typeof cat.subcategories === 'string' ? JSON.parse(cat.subcategories) : (cat.subcategories || [])
        }));
        res.status(200).json(categories);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch categories", error: error.message });
    }
};

export const getCategoryById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.promise().query("SELECT * FROM categories WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Category not found" });
        
        const cat = rows[0];
        cat.subcategories = typeof cat.subcategories === 'string' ? JSON.parse(cat.subcategories) : (cat.subcategories || []);
        
        res.status(200).json(cat);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch category", error: error.message });
    }
};

export const createCategory = async (req, res) => {
    const { name, image, description, subcategories } = req.body;
    try {
        const catId = await generateCatID();
        const subcategoriesJson = JSON.stringify(subcategories || []);
        
        const [result] = await db.promise().query(
            "INSERT INTO categories (catId, name, image, description, subcategories) VALUES (?, ?, ?, ?, ?)",
            [catId, name, image, description, subcategoriesJson]
        );
        
        res.status(201).json({ message: "Category created successfully", id: result.insertId, catId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create category", error: error.message });
    }
};

export const updateCategory = async (req, res) => {
    const { id } = req.params;
    const { name, image, description, subcategories } = req.body;
    try {
        const subcategoriesJson = JSON.stringify(subcategories || []);
        
        await db.promise().query(
            "UPDATE categories SET name = ?, image = ?, description = ?, subcategories = ? WHERE id = ?",
            [name, image, description, subcategoriesJson, id]
        );
        
        res.status(200).json({ message: "Category updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update category", error: error.message });
    }
};

export const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query("DELETE FROM categories WHERE id = ?", [id]);
        res.status(200).json({ message: "Category deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete category", error: error.message });
    }
};
