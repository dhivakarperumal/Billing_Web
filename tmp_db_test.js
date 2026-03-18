import mysql from "mysql2";
import dotenv from "dotenv";
dotenv.config({ path: 'd:/Q Techx Projects/Q Techx Mobile App/BillingSoftware_Web/Backend/.env' });

const config = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};

console.log("Testing with config:", { host: config.host, database: config.database, user: config.user });

const connection = mysql.createConnection(config);

connection.connect(err => {
  if (err) {
    console.error('Database connection failed:', err.message);
    process.exit(1);
  }
  console.log('Connected to database.');
  
  connection.query('SHOW TABLES', (err, results) => {
    if (err) {
      console.error('Error fetching tables:', err.message);
    } else {
      console.log('Tables in database:', results);
    }
    connection.end();
  });
});
