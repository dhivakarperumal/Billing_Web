const mysql = require("mysql2/promise");
require("dotenv").config({ path: './Backend/.env' });

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'billing_system',
};

async function updateSchema() {
  const connection = await mysql.createConnection(config);
  
  try {
    console.log("Updating orders table schema...");
    
    // Add columns if they don't exist
    const [columns] = await connection.query(`SHOW COLUMNS FROM orders`);
    const columnNames = columns.map(c => c.Field);
    
    if (!columnNames.includes('customer_phone')) {
      await connection.query(`ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(50) AFTER customer_name`);
      console.log("Added customer_phone column.");
    }
    
    if (!columnNames.includes('items')) {
      await connection.query(`ALTER TABLE orders ADD COLUMN items LONGTEXT AFTER total_amount`);
      console.log("Added items column.");
    }
    
    console.log("Schema update complete.");
  } catch (error) {
    console.error("Schema update error:", error);
  } finally {
    await connection.end();
  }
}

updateSchema();
