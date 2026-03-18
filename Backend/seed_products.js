import db from "./src/config/db.js";

const supermarketProducts = [
  {
    name: "Organic Brown Rice",
    description: "Healthy organic brown rice rich in fiber.",
    rating: 4.5,
    category: "Groceries",
    subCategory: "Rice & Grains",
    status: "Active",
    total_stock: 120,
    pricing: { mrp: 120, discount: 10, sellingPrice: 108 },
    variants: [
      { quantity: "1", unit: "kg", mrp: 120, discount: 10, sellingPrice: 108, stock: 60 },
      { quantity: "5", unit: "kg", mrp: 550, discount: 8, sellingPrice: 506, stock: 60 }
    ],
    expiry: { mfgDate: "2026-01-10", expDate: "2027-01-10", batchNo: "BR001" },
    supplier: { name: "Green Farms", contact: "+91 9876543210" }
  },
  {
    name: "Basmati Rice Premium",
    description: "Long grain premium basmati rice.",
    rating: 4.6,
    category: "Groceries",
    subCategory: "Rice & Grains",
    status: "Active",
    total_stock: 100,
    pricing: { mrp: 180, discount: 12, sellingPrice: 158.4 },
    variants: [
      { quantity: "1", unit: "kg", mrp: 180, discount: 12, sellingPrice: 158.4, stock: 50 },
      { quantity: "5", unit: "kg", mrp: 850, discount: 10, sellingPrice: 765, stock: 50 }
    ],
    expiry: { mfgDate: "2026-02-01", expDate: "2027-02-01", batchNo: "BR002" },
    supplier: { name: "India Rice Mills", contact: "+91 9876500001" }
  },
  {
    name: "Aashirvaad Atta",
    description: "Whole wheat flour for soft rotis.",
    rating: 4.7,
    category: "Groceries",
    subCategory: "Flour",
    status: "Active",
    total_stock: 150,
    pricing: { mrp: 260, discount: 10, sellingPrice: 234 },
    variants: [
      { quantity: "5", unit: "kg", mrp: 260, discount: 10, sellingPrice: 234, stock: 80 },
      { quantity: "10", unit: "kg", mrp: 500, discount: 8, sellingPrice: 460, stock: 70 }
    ],
    expiry: { mfgDate: "2026-02-10", expDate: "2026-08-10", batchNo: "ATT001" },
    supplier: { name: "ITC Foods", contact: "+91 9988776655" }
  },
  {
    name: "Fortune Sunflower Oil",
    description: "Refined sunflower cooking oil.",
    rating: 4.6,
    category: "Cooking Essentials",
    subCategory: "Edible Oil",
    status: "Active",
    total_stock: 90,
    pricing: { mrp: 190, discount: 8, sellingPrice: 174.8 },
    variants: [
      { quantity: "1", unit: "L", mrp: 190, discount: 8, sellingPrice: 174.8, stock: 50 },
      { quantity: "5", unit: "L", mrp: 900, discount: 10, sellingPrice: 810, stock: 40 }
    ],
    expiry: { mfgDate: "2026-01-15", expDate: "2027-01-15", batchNo: "OIL001" },
    supplier: { name: "Adani Wilmar", contact: "+91 9871122334" }
  },
  {
    name: "Tata Tea Gold",
    description: "Premium strong tea leaves.",
    rating: 4.4,
    category: "Beverages",
    subCategory: "Tea",
    status: "Active",
    total_stock: 140,
    pricing: { mrp: 550, discount: 15, sellingPrice: 467.5 },
    variants: [
      { quantity: "500", unit: "g", mrp: 275, discount: 10, sellingPrice: 247.5, stock: 70 },
      { quantity: "1", unit: "kg", mrp: 550, discount: 15, sellingPrice: 467.5, stock: 70 }
    ],
    expiry: { mfgDate: "2026-01-01", expDate: "2027-01-01", batchNo: "TEA001" },
    supplier: { name: "Tata Consumer", contact: "+91 9090909090" }
  },
  {
    name: "Maggi Instant Noodles",
    description: "2 minute instant noodles.",
    rating: 4.8,
    category: "Snacks",
    subCategory: "Instant Noodles",
    status: "Active",
    total_stock: 300,
    pricing: { mrp: 14, discount: 5, sellingPrice: 13.3 },
    variants: [
      { quantity: "70", unit: "g", mrp: 14, discount: 5, sellingPrice: 13.3, stock: 300 }
    ],
    expiry: { mfgDate: "2026-02-01", expDate: "2027-02-01", batchNo: "MAG001" },
    supplier: { name: "Nestle India", contact: "+91 9812345678" }
  },
  {
    name: "Amul Butter",
    description: "Salted butter rich taste.",
    rating: 4.9,
    category: "Dairy",
    subCategory: "Butter",
    status: "Active",
    total_stock: 110,
    pricing: { mrp: 58, discount: 4, sellingPrice: 55.68 },
    variants: [
      { quantity: "100", unit: "g", mrp: 58, discount: 4, sellingPrice: 55.68, stock: 110 }
    ],
    expiry: { mfgDate: "2026-03-01", expDate: "2026-09-01", batchNo: "BUT001" },
    supplier: { name: "Amul Dairy", contact: "+91 9765432109" }
  },
  {
    name: "Amul Milk",
    description: "Fresh full cream milk.",
    rating: 4.4,
    category: "Dairy",
    subCategory: "Milk",
    status: "Active",
    total_stock: 200,
    pricing: { mrp: 60, discount: 5, sellingPrice: 57 },
    variants: [
      { quantity: "500", unit: "ml", mrp: 35, discount: 3, sellingPrice: 33.95, stock: 100 },
      { quantity: "1", unit: "L", mrp: 60, discount: 5, sellingPrice: 57, stock: 100 }
    ],
    expiry: { mfgDate: "2026-03-15", expDate: "2026-03-20", batchNo: "MLK001" },
    supplier: { name: "Amul Dairy", contact: "+91 9988001122" }
  },
  {
    name: "Britannia Good Day Biscuits",
    description: "Crunchy butter biscuits.",
    rating: 4.2,
    category: "Snacks",
    subCategory: "Biscuits",
    status: "Active",
    total_stock: 180,
    pricing: { mrp: 35, discount: 6, sellingPrice: 32.9 },
    variants: [
      { quantity: "200", unit: "g", mrp: 35, discount: 6, sellingPrice: 32.9, stock: 180 }
    ],
    expiry: { mfgDate: "2026-01-20", expDate: "2026-07-20", batchNo: "BIS001" },
    supplier: { name: "Britannia", contact: "+91 9345678901" }
  },
  {
    name: "Parle G Biscuits",
    description: "Classic glucose biscuits.",
    rating: 4.5,
    category: "Snacks",
    subCategory: "Biscuits",
    status: "Active",
    total_stock: 250,
    pricing: { mrp: 10, discount: 5, sellingPrice: 9.5 },
    variants: [
      { quantity: "80", unit: "g", mrp: 10, discount: 5, sellingPrice: 9.5, stock: 250 }
    ],
    expiry: { mfgDate: "2026-02-01", expDate: "2026-08-01", batchNo: "BIS002" },
    supplier: { name: "Parle Products", contact: "+91 9012345678" }
  },
  {
    name: "Coca Cola Soft Drink",
    description: "Refreshing cold drink.",
    rating: 4.1,
    category: "Beverages",
    subCategory: "Soft Drinks",
    status: "Active",
    total_stock: 220,
    pricing: { mrp: 40, discount: 5, sellingPrice: 38 },
    variants: [
      { quantity: "750", unit: "ml", mrp: 40, discount: 5, sellingPrice: 38, stock: 120 },
      { quantity: "2", unit: "L", mrp: 95, discount: 7, sellingPrice: 88.35, stock: 100 }
    ],
    expiry: { mfgDate: "2026-02-01", expDate: "2026-12-01", batchNo: "COL001" },
    supplier: { name: "Coca Cola India", contact: "+91 9870001112" }
  },
  {
    name: "Pepsi Soft Drink",
    description: "Refreshing cola beverage.",
    rating: 4.0,
    category: "Beverages",
    subCategory: "Soft Drinks",
    status: "Active",
    total_stock: 200,
    pricing: { mrp: 40, discount: 5, sellingPrice: 38 },
    variants: [
      { quantity: "750", unit: "ml", mrp: 40, discount: 5, sellingPrice: 38, stock: 100 },
      { quantity: "2", unit: "L", mrp: 95, discount: 7, sellingPrice: 88.35, stock: 100 }
    ],
    expiry: { mfgDate: "2026-02-05", expDate: "2026-12-05", batchNo: "COL002" },
    supplier: { name: "PepsiCo", contact: "+91 9898989898" }
  },
  {
    name: "Fresh Red Apples",
    description: "Sweet and crispy apples.",
    rating: 4.6,
    category: "Fruits & Vegetables",
    subCategory: "Fresh Fruits",
    status: "Active",
    total_stock: 160,
    pricing: { mrp: 180, discount: 10, sellingPrice: 162 },
    variants: [
      { quantity: "1", unit: "kg", mrp: 180, discount: 10, sellingPrice: 162, stock: 160 }
    ],
    expiry: { mfgDate: "2026-03-10", expDate: "2026-03-25", batchNo: "APP001" },
    supplier: { name: "Farm Fresh", contact: "+91 9001122334" }
  },
  {
    name: "Bananas",
    description: "Fresh ripe bananas.",
    rating: 4.3,
    category: "Fruits & Vegetables",
    subCategory: "Fresh Fruits",
    status: "Active",
    total_stock: 180,
    pricing: { mrp: 60, discount: 8, sellingPrice: 55.2 },
    variants: [
      { quantity: "1", unit: "dozen", mrp: 60, discount: 8, sellingPrice: 55.2, stock: 180 }
    ],
    expiry: { mfgDate: "2026-03-15", expDate: "2026-03-25", batchNo: "BAN001" },
    supplier: { name: "Local Farms", contact: "+91 9011122233" }
  },
  {
    name: "Potatoes",
    description: "Farm fresh potatoes.",
    rating: 4.2,
    category: "Fruits & Vegetables",
    subCategory: "Vegetables",
    status: "Active",
    total_stock: 300,
    pricing: { mrp: 40, discount: 5, sellingPrice: 38 },
    variants: [
      { quantity: "1", unit: "kg", mrp: 40, discount: 5, sellingPrice: 38, stock: 300 }
    ],
    expiry: { mfgDate: "2026-03-10", expDate: "2026-04-10", batchNo: "VEG001" },
    supplier: { name: "Fresh Veg Market", contact: "+91 9022233344" }
  },
  {
    name: "Onions",
    description: "Fresh red onions.",
    rating: 4.1,
    category: "Fruits & Vegetables",
    subCategory: "Vegetables",
    status: "Active",
    total_stock: 250,
    pricing: { mrp: 45, discount: 6, sellingPrice: 42.3 },
    variants: [
      { quantity: "1", unit: "kg", mrp: 45, discount: 6, sellingPrice: 42.3, stock: 250 }
    ],
    expiry: { mfgDate: "2026-03-12", expDate: "2026-04-12", batchNo: "VEG002" },
    supplier: { name: "Fresh Veg Market", contact: "+91 9022233344" }
  },
  {
    name: "Tomatoes",
    description: "Fresh red tomatoes.",
    rating: 4.0,
    category: "Fruits & Vegetables",
    subCategory: "Vegetables",
    status: "Active",
    total_stock: 220,
    pricing: { mrp: 50, discount: 5, sellingPrice: 47.5 },
    variants: [
      { quantity: "1", unit: "kg", mrp: 50, discount: 5, sellingPrice: 47.5, stock: 220 }
    ],
    expiry: { mfgDate: "2026-03-15", expDate: "2026-03-25", batchNo: "VEG003" },
    supplier: { name: "Farm Fresh", contact: "+91 9033344455" }
  },
  {
    name: "Sugar",
    description: "Refined white sugar.",
    rating: 4.4,
    category: "Groceries",
    subCategory: "Sugar",
    status: "Active",
    total_stock: 200,
    pricing: { mrp: 50, discount: 6, sellingPrice: 47 },
    variants: [
      { quantity: "1", unit: "kg", mrp: 50, discount: 6, sellingPrice: 47, stock: 200 }
    ],
    expiry: { mfgDate: "2026-01-01", expDate: "2027-01-01", batchNo: "SUG001" },
    supplier: { name: "India Sugar Mills", contact: "+91 9111222233" }
  },
  {
    name: "Salt",
    description: "Iodized table salt.",
    rating: 4.3,
    category: "Groceries",
    subCategory: "Salt",
    status: "Active",
    total_stock: 190,
    pricing: { mrp: 20, discount: 5, sellingPrice: 19 },
    variants: [
      { quantity: "1", unit: "kg", mrp: 20, discount: 5, sellingPrice: 19, stock: 190 }
    ],
    expiry: { mfgDate: "2026-01-10", expDate: "2028-01-10", batchNo: "SLT001" },
    supplier: { name: "Tata Salt", contact: "+91 9444555566" }
  },
  {
    name: "Ketchup",
    description: "Tomato ketchup sauce.",
    rating: 4.5,
    category: "Sauces",
    subCategory: "Ketchup",
    status: "Active",
    total_stock: 120,
    pricing: { mrp: 110, discount: 10, sellingPrice: 99 },
    variants: [
      { quantity: "500", unit: "g", mrp: 110, discount: 10, sellingPrice: 99, stock: 120 }
    ],
    expiry: { mfgDate: "2026-02-01", expDate: "2027-02-01", batchNo: "KET001" },
    supplier: { name: "Kissan", contact: "+91 9555666777" }
  }
];

const seedProducts = async () => {
  console.log("🌱 Seeding Supermarket Products...");
  const connection = db.promise();

  try {
    for (let i = 0; i < supermarketProducts.length; i++) {
        const item = supermarketProducts[i];
        const product_code = `PB${(i + 1).toString().padStart(3, '0')}`;
        const variantsJson = JSON.stringify(item.variants);
        const expiryJson = JSON.stringify(item.expiry);
        const supplierJson = JSON.stringify(item.supplier);
        
        // Placeholder images
        const images = JSON.stringify([
            `https://ui-avatars.com/api/?name=${encodeURIComponent(item.name)}&background=random&color=fff&size=512`
        ]);

        console.log(`📡 Adding product: ${item.name} (${product_code})...`);

        await connection.query(
            `INSERT INTO products (
                product_code, name, category, subcategory, mrp, offer_price, 
                total_stock, status, images, variants, expiry, supplier, 
                rating, description
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
            name = VALUES(name),
            category = VALUES(category),
            subcategory = VALUES(subcategory),
            mrp = VALUES(mrp),
            offer_price = VALUES(offer_price),
            total_stock = VALUES(total_stock),
            status = VALUES(status),
            variants = VALUES(variants),
            expiry = VALUES(expiry),
            supplier = VALUES(supplier),
            rating = VALUES(rating),
            description = VALUES(description)`,
            [
                product_code, item.name, item.category, item.subCategory, 
                item.pricing.mrp, item.pricing.sellingPrice, item.total_stock, 
                item.status, images, variantsJson, expiryJson, supplierJson, 
                item.rating, item.description
            ]
        );
    }

    console.log("✨ Seeding complete! Added/Updated 20 products.");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await db.end();
    process.exit();
  }
};

seedProducts();
