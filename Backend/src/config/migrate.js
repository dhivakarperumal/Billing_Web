import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../../.env") });

const migrate = async () => {
    console.log("🚀 Starting Database Migration (Safe Creation & Updates)...");
    
    const dbConfig = {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        port: process.env.DB_PORT || 3306,
    };
    
    const dbName = process.env.DB_NAME || "billing_system";

    let connection;
    try {
        // 1. Connect without DB name to create it if missing
        connection = await mysql.createConnection(dbConfig);
        console.log(`📡 Checking/Creating database: ${dbName}`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        await connection.query(`USE \`${dbName}\``);

        // 2. Categories Table
        console.log("🛠️ Checking table: categories...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS categories (
                id INT AUTO_INCREMENT PRIMARY KEY,
                catId VARCHAR(50) UNIQUE,
                name VARCHAR(255) NOT NULL,
                image LONGTEXT,
                description TEXT,
                subcategories LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        // 3. Products Table
        console.log("🛠️ Checking table: products...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_code VARCHAR(50) UNIQUE,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(255),
                subcategory VARCHAR(255),
                mrp DECIMAL(12,2) DEFAULT 0,
                offer_price DECIMAL(12,2) DEFAULT 0,
                total_stock INT DEFAULT 0,
                status VARCHAR(50) DEFAULT 'Active',
                images LONGTEXT,
                variants LONGTEXT,
                expiry LONGTEXT,
                supplier LONGTEXT,
                rating DECIMAL(3,2) DEFAULT 0,
                description TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        // 4. Users Table
        console.log("🛠️ Checking table: users...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId VARCHAR(50) UNIQUE,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255),
                phone VARCHAR(20),
                role VARCHAR(50) DEFAULT 'user',
                googleId VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        // 5. Orders Table
        console.log("🛠️ Checking table: orders...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT AUTO_INCREMENT PRIMARY KEY,
                customer_name VARCHAR(255),
                customer_phone VARCHAR(50),
                total_amount DECIMAL(12,2) DEFAULT 0,
                items LONGTEXT,
                status VARCHAR(50) DEFAULT 'Paid',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        // 6. Dealers Table
        console.log("🛠️ Checking table: dealers...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS dealers (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                contact VARCHAR(255) NOT NULL,
                email VARCHAR(255),
                phone VARCHAR(20) NOT NULL,
                location VARCHAR(255),
                status VARCHAR(50) DEFAULT 'Pending',
                rating DECIMAL(3,2) DEFAULT 4.5,
                orders INT DEFAULT 0,
                image LONGTEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        `);

        // 7. Invoices Table
        console.log("🛠️ Checking table: invoices...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INT AUTO_INCREMENT PRIMARY KEY,
                dealer_id INT NOT NULL,
                invoice_date DATE NOT NULL,
                total_amount DECIMAL(12,2) NOT NULL,
                status VARCHAR(50) DEFAULT 'Pending',
                document_path VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (dealer_id) REFERENCES dealers(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // 8. Invoice Items Table
        console.log("🛠️ Checking table: invoice_items...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS invoice_items (
                id INT AUTO_INCREMENT PRIMARY KEY,
                invoice_id INT NOT NULL,
                product_id INT NOT NULL,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(12,2) NOT NULL,
                quantity INT NOT NULL,
                total DECIMAL(12,2) NOT NULL,
                FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        `);

        // 9. Schema Upgrades (Ensure consistency)
        console.log("🔄 Verifying schema consistency for existing tables...");

        const upgrades = [
            { table: "categories", column: "subcategories", type: "LONGTEXT AFTER description" },
            { table: "products", column: "subcategory", type: "VARCHAR(255) AFTER category" },
            { table: "products", column: "name_tamil", type: "VARCHAR(255) AFTER name" },
            { table: "products", column: "expiry", type: "LONGTEXT AFTER variants" },
            { table: "products", column: "supplier", type: "LONGTEXT AFTER expiry" },
            { table: "products", column: "rating", type: "DECIMAL(3,2) DEFAULT 0 AFTER supplier" },
            { table: "orders", column: "customer_phone", type: "VARCHAR(50) AFTER customer_name" },
            { table: "orders", column: "items", type: "LONGTEXT AFTER total_amount" },
            { table: "users", column: "phone", type: "VARCHAR(20) AFTER password" }
        ];

        for (const upgrade of upgrades) {
            const [columns] = await connection.query(`SHOW COLUMNS FROM \`${upgrade.table}\` LIKE ?`, [upgrade.column]);
            if (columns.length === 0) {
                console.log(`📡 Adding missing column \`${upgrade.column}\` to \`${upgrade.table}\`...`);
                await connection.query(`ALTER TABLE \`${upgrade.table}\` ADD COLUMN ${upgrade.column} ${upgrade.type}`);
            }
        }

        console.log("✨ Migration successful! All tables and columns are up to date.");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        throw error;
    } finally {
        if (connection) await connection.end();
    }
};

export default migrate;

// If run directly via `node src/config/migrate.js`, exit with non-zero on failure.
if (fileURLToPath(import.meta.url) === process.argv[1]) {
    migrate().catch((error) => {
        console.error("❌ Migration failed:", error);
        process.exit(1);
    });
}
