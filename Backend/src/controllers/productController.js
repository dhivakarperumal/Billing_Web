import db from "../config/db.js";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists in the Backend folder
const uploadsDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

// Helper to save and compress image (handles Base64 strings from frontend)
const processImages = async (base64Array) => {
    if (!base64Array || base64Array.length === 0) return [];

    const imagePaths = [];
    for (let i = 0; i < base64Array.length; i++) {
        const base64Str = base64Array[i];
        if (!base64Str.startsWith('data:image')) continue; // Skip non-image strings

        // Extract buffer from base64
        const parts = base64Str.split(';base64,');
        const buffer = Buffer.from(parts[1], 'base64');

        const fileName = `${Date.now()}-${i}.webp`;
        const filePath = path.join(uploadsDir, fileName);

        await sharp(buffer)
            .webp({ quality: 80 })
            .toFile(filePath);

        imagePaths.push(`/uploads/${fileName}`);
    }
    return imagePaths;
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
            variants: typeof p.variants === 'string' ? JSON.parse(p.variants) : (p.variants || []),
            expiry: typeof p.expiry === 'string' ? JSON.parse(p.expiry) : (p.expiry || {}),
            supplier: typeof p.supplier === 'string' ? JSON.parse(p.supplier) : (p.supplier || {})
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
        prod.expiry = typeof prod.expiry === 'string' ? JSON.parse(prod.expiry) : (prod.expiry || {});
        prod.supplier = typeof prod.supplier === 'string' ? JSON.parse(prod.supplier) : (prod.supplier || {});

        res.status(200).json(prod);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch product", error: error.message });
    }
};

export const createProduct = async (req, res) => {
    let { product_code, name, category, subCategory, mrp, offer_price, total_stock, status, variants, description, expiry, supplier, rating, images } = req.body;
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

        const [result] = await db.promise().query(
            "INSERT INTO products (product_code, name, category, subcategory, mrp, offer_price, total_stock, status, images, variants, expiry, supplier, rating, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [product_code, name || "", category || "", subCategory || "", numMrp, numOffer, numStock, (status === 'Inactive' ? 'Inactive' : 'Active'), imagesJson, variantsJson, expiryJson, supplierJson, numRating, description || ""]
        );

        res.status(201).json({ message: "Product created successfully", id: result.insertId, product_code });
    } catch (error) {
        console.error("Create Product Error:", error);
        res.status(500).json({ message: "Failed to create product", error: error.message });
    }
};

export const updateProduct = async (req, res) => {
    const { id } = req.params;
    let { product_code, name, category, subCategory, mrp, offer_price, total_stock, status, images, variants, description, expiry, supplier, rating } = req.body;
    try {
        // Separate existing images from new base64 strings
        const existingImages = (images || []).filter(img => !img.startsWith('data:image'));
        const newBase64Images = (images || []).filter(img => img.startsWith('data:image'));

        // Process new base64 images
        const newImagePaths = await processImages(newBase64Images);
        
        // Combine existing URLs with new file paths
        const finalImagePaths = [...existingImages, ...newImagePaths];
        const imagesJson = JSON.stringify(finalImagePaths);

        const variantsJson = JSON.stringify(variants || []);
        const expiryJson = JSON.stringify(expiry || {});
        const supplierJson = JSON.stringify(supplier || {});

        // Convert numbers from strings
        const numMrp = Number(mrp) || 0;
        const numOffer = Number(offer_price) || 0;
        const numStock = Number(total_stock) || 0;
        const numRating = Number(rating) || 0;

        await db.promise().query(
            "UPDATE products SET product_code = ?, name = ?, category = ?, subcategory = ?, mrp = ?, offer_price = ?, total_stock = ?, status = ?, images = ?, variants = ?, expiry = ?, supplier = ?, rating = ?, description = ? WHERE id = ?",
            [product_code, name || "", category || "", subCategory || "", numMrp, numOffer, numStock, (status || "Active"), imagesJson, variantsJson, expiryJson, supplierJson, numRating, description || "", id]
        );

        res.status(200).json({ message: "Product updated successfully", images: finalImagePaths });
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
