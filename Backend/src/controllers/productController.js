import db from "../config/db.js";
import sharp from "sharp";

// Helper to compress Base64 images on the server without disk writes
const processImages = async (imagesArray) => {
    if (!imagesArray || imagesArray.length === 0) return [];

    const compressed = [];

    for (const image of imagesArray) {
        if (typeof image !== 'string') continue;

        if (image.startsWith('data:image')) {
            try {
                const parts = image.split(';base64,');
                const buffer = Buffer.from(parts[1], 'base64');

                const webpBuffer = await sharp(buffer).webp({ quality: 80 }).toBuffer();
                compressed.push(`data:image/webp;base64,${webpBuffer.toString('base64')}`);
            } catch (err) {
                console.error("Image compression error:", err);
                compressed.push(image); // fallback to original data URL
            }
        } else {
            // Keep existing URL or path as-is
            compressed.push(image);
        }
    }

    return compressed;
};

// Helper to generate Product Code
const generateProductCode = async () => {
    const prefix = "PB";
    try {
        const [rows] = await db.promise().query(
            "SELECT product_code FROM products WHERE product_code LIKE ? ORDER BY id DESC LIMIT 1",
            [`${prefix}%`]
        );

        let nextNum = 1;
        if (rows.length > 0) {
            const lastId = rows[0].product_code;
            const numericPart = lastId.substring(prefix.length);
            const lastNum = parseInt(numericPart, 10);
            if (!isNaN(lastNum)) {
                nextNum = lastNum + 1;
            }
        }

        return `${prefix}${nextNum.toString().padStart(3, '0')}`;
    } catch (error) {
        console.error("Error generating product code:", error);
        return `${prefix}001`;
    }
};

export const getNextProductId = async (req, res) => {
    try {
        const nextId = await generateProductCode();
        res.status(200).json({ nextId });
    } catch (error) {
        res.status(500).json({ message: "Failed to generate ID" });
    }
};

export const getProducts = async (req, res) => {
    const { page = 1, limit = 8, search = "", status = "All" } = req.query;
    const offset = (page - 1) * limit;

    try {
        // Try to include name_tamil in search; if column doesn't exist, fall back to name only
        let query = "SELECT * FROM products WHERE (name LIKE ? OR product_code LIKE ?)";
        const queryParams = [`%${search}%`, `%${search}%`];

        // Check if name_tamil column exists first (graceful fallback)
        try {
            const [columns] = await db.promise().query(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'name_tamil'"
            );
            if (columns && columns.length > 0) {
                // Column exists, include it in the search
                query = "SELECT * FROM products WHERE (name LIKE ? OR name_tamil LIKE ? OR product_code LIKE ?)";
                queryParams.splice(1, 0, `%${search}%`);
            }
        } catch (err) {
            console.warn("Could not check for name_tamil column, using fallback search", err.message);
        }

        if (status === "Low Stock") {
            query += " AND total_stock < 10 AND total_stock > 0";
        } else if (status === "Out of Stock") {
            query += " AND total_stock = 0";
        }

        query += " ORDER BY id DESC LIMIT ? OFFSET ?";
        queryParams.push(parseInt(limit), parseInt(offset));

        const [products] = await db.promise().query(query, queryParams);
        
        // Use same fallback logic for count query
        let countQuery = "SELECT COUNT(*) as count FROM products WHERE (name LIKE ? OR product_code LIKE ?)";
        const countParams = [`%${search}%`, `%${search}%`];
        
        try {
            const [columns] = await db.promise().query(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'name_tamil'"
            );
            if (columns && columns.length > 0) {
                countQuery = "SELECT COUNT(*) as count FROM products WHERE (name LIKE ? OR name_tamil LIKE ? OR product_code LIKE ?)";
                countParams.splice(1, 0, `%${search}%`);
            }
        } catch (err) {
            console.warn("Could not check for name_tamil column in count query", err.message);
        }
        
        const [totalRows] = await db.promise().query(countQuery, countParams);

        const [activeRows] = await db.promise().query("SELECT COUNT(*) as count FROM products WHERE status = 'Active'");
        const [lowStockRows] = await db.promise().query("SELECT COUNT(*) as count FROM products WHERE total_stock < 10 AND total_stock > 0");
        const [outOfStockRows] = await db.promise().query("SELECT COUNT(*) as count FROM products WHERE total_stock = 0");

        const data = products.map(p => {
            let parsedImages = [];
            try {
                if (typeof p.images === 'string') {
                    // Check if it's a JSON array
                    if (p.images.startsWith('[') && p.images.endsWith(']')) {
                        parsedImages = JSON.parse(p.images);
                    } else {
                        // It's a single URL string
                        parsedImages = [p.images];
                    }
                } else {
                    parsedImages = p.images || [];
                }
            } catch (e) {
                console.error("Image Parse Error:", e, p.images);
                parsedImages = [];
            }

            return {
                ...p,
                images: parsedImages,
                variants: typeof p.variants === 'string' ? JSON.parse(p.variants) : (p.variants || []),
                expiry: typeof p.expiry === 'string' ? JSON.parse(p.expiry) : (p.expiry || {}),
                supplier: typeof p.supplier === 'string' ? JSON.parse(p.supplier) : (p.supplier || {})
            };
        });

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
        try {
            if (typeof prod.images === 'string') {
                if (prod.images.startsWith('[') && prod.images.endsWith(']')) {
                    prod.images = JSON.parse(prod.images);
                } else {
                    prod.images = [prod.images];
                }
            } else {
                prod.images = prod.images || [];
            }
        } catch (e) {
            prod.images = [];
        }
        prod.variants = typeof prod.variants === 'string' ? JSON.parse(prod.variants) : (prod.variants || []);
        prod.expiry = typeof prod.expiry === 'string' ? JSON.parse(prod.expiry) : (prod.expiry || {});
        prod.supplier = typeof prod.supplier === 'string' ? JSON.parse(prod.supplier) : (prod.supplier || {});

        res.status(200).json(prod);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch product", error: error.message });
    }
};

export const createProduct = async (req, res) => {
    let { product_code, name, category, subCategory, mrp, offer_price, total_stock, status, variants, description, expiry, supplier, rating, images, name_tamil } = req.body;
    try {
        if (!product_code) {
            product_code = await generateProductCode();
        }

        // Process uploaded base64 images
        let imagesJson = "[]";
        try {
            const imagePaths = await processImages(images);
            imagesJson = JSON.stringify(imagePaths);
        } catch (imgErr) {
            console.error("Image Processing Error:", imgErr);
        }

        const variantsJson = JSON.stringify(variants);
        const expiryJson = JSON.stringify(expiry);
        const supplierJson = JSON.stringify(supplier);

        // Convert numbers from strings
        const numMrp = Number(mrp) || 0;
        const numOffer = Number(offer_price) || 0;
        const numStock = Number(total_stock) || 0;
        const numRating = Number(rating) || 0;

        // Check if name_tamil column exists before inserting
        let insertQuery = "INSERT INTO products (product_code, name, category, subcategory, mrp, offer_price, total_stock, status, images, variants, expiry, supplier, rating, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        let insertParams = [product_code, name || "", category || "", subCategory || "", numMrp, numOffer, numStock, (status === 'Inactive' ? 'Inactive' : 'Active'), imagesJson, variantsJson, expiryJson, supplierJson, numRating, description || ""];

        try {
            const [columns] = await db.promise().query(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'name_tamil'"
            );
            if (columns && columns.length > 0) {
                // Column exists, include it
                insertQuery = "INSERT INTO products (product_code, name, name_tamil, category, subcategory, mrp, offer_price, total_stock, status, images, variants, expiry, supplier, rating, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                insertParams.splice(2, 0, name_tamil || "");
            }
        } catch (err) {
            console.warn("Could not check for name_tamil column, using fallback insert", err.message);
        }

        const [result] = await db.promise().query(insertQuery, insertParams);

        res.status(201).json({ message: "Product created successfully", id: result.insertId, product_code });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ message: "Failed to create product", error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    let { product_code, name, category, subCategory, mrp, offer_price, total_stock, status, images, variants, description, expiry, supplier, rating, name_tamil } = req.body;
    try {
        // Process all images (base64 compress + keep any existing URL/path as-is)
        const finalImages = await processImages(images || []);
        const imagesJson = JSON.stringify(finalImages);

        const variantsJson = JSON.stringify(variants || []);
        const expiryJson = JSON.stringify(expiry || {});
        const supplierJson = JSON.stringify(supplier || {});

        // Convert numbers from strings
        const numMrp = Number(mrp) || 0;
        const numOffer = Number(offer_price) || 0;
        const numStock = Number(total_stock) || 0;
        const numRating = Number(rating) || 0;

        // Check if name_tamil column exists before updating
        let updateQuery = "UPDATE products SET product_code = ?, name = ?, category = ?, subcategory = ?, mrp = ?, offer_price = ?, total_stock = ?, status = ?, images = ?, variants = ?, expiry = ?, supplier = ?, rating = ?, description = ? WHERE id = ?";
        let updateParams = [product_code, name || "", category || "", subCategory || "", numMrp, numOffer, numStock, (status || "Active"), imagesJson, variantsJson, expiryJson, supplierJson, numRating, description || "", id];

        try {
            const [columns] = await db.promise().query(
                "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'products' AND COLUMN_NAME = 'name_tamil'"
            );
            if (columns && columns.length > 0) {
                // Column exists, include it
                updateQuery = "UPDATE products SET product_code = ?, name = ?, name_tamil = ?, category = ?, subcategory = ?, mrp = ?, offer_price = ?, total_stock = ?, status = ?, images = ?, variants = ?, expiry = ?, supplier = ?, rating = ?, description = ? WHERE id = ?";
                updateParams.splice(2, 0, name_tamil || "");
            }
        } catch (err) {
            console.warn("Could not check for name_tamil column, using fallback update", err.message);
        }

        await db.promise().query(updateQuery, updateParams);

        res.status(200).json({ message: "Product updated successfully", images: finalImages });
    } catch (error) {
        console.error("Update Product Error:", error);
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
