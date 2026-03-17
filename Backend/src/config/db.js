import mysql from "mysql2";
import "./env.js";

// Remove the local dotenv.config() call as it's handled by env.js

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log("Database connection error:", err);
  } else {
    console.log("MySQL Connected");
  }
});

export default db;