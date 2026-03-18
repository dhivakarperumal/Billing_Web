import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const config = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "billing_system",
};

async function migrate() {
  let connection;
  try {
    console.log("🚀 Starting Database Migration...");
    
    // 1. Create connection without database to ensure DB exists
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
    });

    console.log(`Checking/Creating database: ${config.database}`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
    await connection.query(`USE \`${config.database}\``);

    // 2. Define expected tables and schemas
    const tables = {
      categories: `
        CREATE TABLE IF NOT EXISTS categories (
          id INT AUTO_INCREMENT PRIMARY KEY,
          catId VARCHAR(50) UNIQUE,
          name VARCHAR(255) NOT NULL,
          image LONGTEXT,
          description TEXT,
          subcategories LONGTEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      products: `
        CREATE TABLE IF NOT EXISTS products (
          id INT AUTO_INCREMENT PRIMARY KEY,
          product_code VARCHAR(50) UNIQUE,
          name VARCHAR(255) NOT NULL,
          category VARCHAR(255),
          subcategory VARCHAR(255),
          mrp DECIMAL(10,2),
          offer_price DECIMAL(10,2),
          total_stock INT DEFAULT 0,
          status ENUM('Active', 'Inactive') DEFAULT 'Active',
          images LONGTEXT,
          variants LONGTEXT,
          expiry LONGTEXT,
          supplier LONGTEXT,
          rating DECIMAL(3,2),
          description TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      users: `
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          userId VARCHAR(50) UNIQUE,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255),
          role VARCHAR(50) DEFAULT 'user',
          googleId VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `,
      orders: `
        CREATE TABLE IF NOT EXISTS orders (
          id INT AUTO_INCREMENT PRIMARY KEY,
          customer_name VARCHAR(255),
          customer_phone VARCHAR(50),
          total_amount DECIMAL(10,2),
          items LONGTEXT,
          status VARCHAR(50) DEFAULT 'Paid',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `
    };

    // 3. Create tables if they don't exist
    for (const [tableName, schema] of Object.entries(tables)) {
      console.log(`Checking table: ${tableName}`);
      await connection.query(schema);
    }

    // 4. Handle Column Upgrades (Ensure existing tables match latest schema)
    console.log("Checking for schema upgrades...");

    const columnUpgrades = [
      { table: "orders", column: "customer_phone", type: "VARCHAR(50) AFTER customer_name" },
      { table: "orders", column: "items", type: "LONGTEXT AFTER total_amount" },
      { table: "products", column: "rating", type: "DECIMAL(3,2) AFTER supplier" },
      { table: "products", column: "description", type: "TEXT AFTER rating" },
      { table: "categories", column: "subcategories", type: "LONGTEXT AFTER description" }
    ];

    for (const upgrade of columnUpgrades) {
      const [columns] = await connection.query(`SHOW COLUMNS FROM \`${upgrade.table}\` LIKE ?`, [upgrade.column]);
      if (columns.length === 0) {
        console.log(`Adding missing column \`${upgrade.column}\` to \`${upgrade.table}\`...`);
        await connection.query(`ALTER TABLE \`${upgrade.table}\` ADD COLUMN ${upgrade.column} ${upgrade.type}`);
      }
    }

    console.log("✨ Migration successful! All tables and columns are up to date.");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    process.exit(1);
  } finally {
    if (connection) await connection.end();
  }
}

migrate();
