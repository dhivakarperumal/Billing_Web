import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config({ path: './Backend/.env' });

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'billing_system',
};

async function initDB() {
  const connection = await mysql.createConnection({
    host: config.host,
    user: config.user,
    password: config.password,
  });

  console.log("Checking database...");
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${config.database}\``);
  await connection.query(`USE \`${config.database}\``);

  console.log("Creating tables...");

  // Categories Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      catId VARCHAR(50) UNIQUE,
      name VARCHAR(255) NOT NULL,
      image LONGTEXT,
      description TEXT,
      subcategories LONGTEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products Table
  await connection.query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_code VARCHAR(50) UNIQUE,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      mrp DECIMAL(10,2),
      offer_price DECIMAL(10,2),
      total_stock INT DEFAULT 0,
      status ENUM('Active', 'Inactive') DEFAULT 'Active',
      images LONGTEXT,
      variants LONGTEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Users Table
  await connection.query(`
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
  `);

  // Orders Table (used by dashboard)
  await connection.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(255),
      total_amount DECIMAL(10,2),
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("Database initialization complete.");
  await connection.end();
}

initDB().catch(console.error);
