import db from "../Backend/src/config/db.js";
import fs from "fs";

const query = async () => {
  const [rows] = await db.promise().query("SELECT id, name, images, variants FROM products WHERE name='Salt' OR product_code='PB019' OR id=19 LIMIT 1;");
  if (rows.length > 0) {
    fs.writeFileSync("../tmp/result.json", JSON.stringify(rows[0], null, 2));
    console.log("DONE");
  } else {
    console.log("NOT FOUND");
  }
  process.exit();
};

query();
