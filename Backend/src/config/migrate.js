import db from "./db.js";

const createTables = async () => {
  console.log("Running database migrations...");

  await db.promise().query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId VARCHAR(32) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255),
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      googleId VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await db.promise().query(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      catId VARCHAR(32) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      image TEXT,
      description TEXT,
      subcategories TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await db.promise().query(`
    CREATE TABLE IF NOT EXISTS products (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_code VARCHAR(32) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(255),
      mrp DECIMAL(12,2) DEFAULT 0,
      offer_price DECIMAL(12,2) DEFAULT 0,
      total_stock INT DEFAULT 0,
      status VARCHAR(50) DEFAULT 'Active',
      images TEXT,
      variants TEXT,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  await db.promise().query(`
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      customer_name VARCHAR(255),
      customer_email VARCHAR(255),
      customer_phone VARCHAR(50),
      items TEXT,
      total_amount DECIMAL(12,2) DEFAULT 0,
      payment_method VARCHAR(100),
      status VARCHAR(100) DEFAULT 'Order Placed',
      tracking_number VARCHAR(255),
      courier_name VARCHAR(255),
      shipped_at DATETIME,
      cancellation_reason TEXT,
      cancelled_at DATETIME,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);

  console.log("Migration complete.");
};

createTables()
  .then(() => db.end())
  .catch((error) => {
    console.error("Migration failed:", error);
    db.end();
    process.exit(1);
  });
