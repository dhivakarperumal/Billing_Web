import db from "../config/db.js";

// Helper to generate Product Code
const generateProductCode = async () => {
    const prefix = "PRD";
    const [rows] = await db.promise().query("SELECT COUNT(*) as count FROM products");
    const count = (rows[0].count || 0) + 1;
    return `${prefix}${count.toString().padStart(4, '0')}`;
};

export const getProducts = async (req, res) => {
    const { page = 1, limit = 8, search = "", status = "All" } = req.query;
    const offset = (page - 1) * limit;

    try {
        let query = "SELECT * FROM products WHERE (name LIKE ? OR product_code LIKE ?)";
        const queryParams = [`%${search}%`, `%${search}%`];

        if (status === "Low Stock") {
            query += " AND total_stock < 10 AND total_stock > 0";
        } else if (status === "Out of Stock") {
            query += " AND total_stock = 0";
        }

        query += " ORDER BY id DESC LIMIT ? OFFSET ?";
        queryParams.push(parseInt(limit), parseInt(offset));

        const [products] = await db.promise().query(query, queryParams);
        const [totalRows] = await db.promise().query("SELECT COUNT(*) as count FROM products WHERE (name LIKE ? OR product_code LIKE ?)", [`%${search}%`, `%${search}%`]);

        const [activeRows] = await db.promise().query("SELECT COUNT(*) as count FROM products WHERE status = 'Active'");
        const [lowStockRows] = await db.promise().query("SELECT COUNT(*) as count FROM products WHERE total_stock < 10 AND total_stock > 0");
        const [outOfStockRows] = await db.promise().query("SELECT COUNT(*) as count FROM products WHERE total_stock = 0");

        const data = products.map(p => ({
            ...p,
            images: typeof p.images === 'string' ? JSON.parse(p.images) : (p.images || []),
            variants: typeof p.variants === 'string' ? JSON.parse(p.variants) : (p.variants || [])
        }));

        res.status(200).json({
            products: data,
            pagination: {
                total: totalRows[0].count,
                totalPages: Math.ceil(totalRows[0].count / limit)
            },
            stats: {
                total: totalRows[0].count,
                active: activeRows[0].count,
                lowStock: lowStockRows[0].count,
                outOfStock: outOfStockRows[0].count
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch products", error: error.message });
    }
};

export const getProductById = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.promise().query("SELECT * FROM products WHERE id = ?", [id]);
        if (rows.length === 0) return res.status(404).json({ message: "Product not found" });
        
        const prod = rows[0];
        prod.images = typeof prod.images === 'string' ? JSON.parse(prod.images) : (prod.images || []);
        prod.variants = typeof prod.variants === 'string' ? JSON.parse(prod.variants) : (prod.variants || []);
        
        res.status(200).json(prod);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch product", error: error.message });
    }
};

export const createProduct = async (req, res) => {
    const { product_code: requestedCode, name, category, mrp, offer_price, total_stock, status, images, variants, description } = req.body;
    try {
        const product_code = requestedCode ? requestedCode : await generateProductCode();
        const imagesJson = JSON.stringify(images || []);
        const variantsJson = JSON.stringify(variants || []);
        
        const [result] = await db.promise().query(
            "INSERT INTO products (product_code, name, category, mrp, offer_price, total_stock, status, images, variants, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [product_code, name, category, mrp, offer_price, total_stock, status || 'Active', imagesJson, variantsJson, description]
        );
        
        res.status(201).json({ message: "Product created successfully", id: result.insertId, product_code });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to create product", error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, category, mrp, offer_price, total_stock, status, images, variants, description } = req.body;
    try {
        const imagesJson = JSON.stringify(images || []);
        const variantsJson = JSON.stringify(variants || []);
        
        await db.promise().query(
            "UPDATE products SET name = ?, category = ?, mrp = ?, offer_price = ?, total_stock = ?, status = ?, images = ?, variants = ?, description = ? WHERE id = ?",
            [name, category, mrp, offer_price, total_stock, status, imagesJson, variantsJson, description, id]
        );
        
        res.status(200).json({ message: "Product updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update product", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query("DELETE FROM products WHERE id = ?", [id]);
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete product", error: error.message });
    }
};
