import db from "./src/config/db.js";

const supermarketCategories = [
  {
    category: "Fruits & Vegetables",
    subcategories: [
      "Fresh Fruits",
      "Fresh Vegetables",
      "Exotic Fruits",
      "Exotic Vegetables",
      "Organic Fruits",
      "Organic Vegetables",
      "Cut Fruits",
      "Herbs & Leaves"
    ]
  },
  {
    category: "Dairy & Bakery",
    subcategories: [
      "Milk",
      "Curd / Yogurt",
      "Butter",
      "Cheese",
      "Paneer",
      "Cream",
      "Bread",
      "Cakes",
      "Buns & Pav",
      "Cookies & Biscuits"
    ]
  },
  {
    category: "Staples & Groceries",
    subcategories: [
      "Rice",
      "Wheat / Atta",
      "Dal / Pulses",
      "Cooking Oil",
      "Ghee",
      "Sugar & Jaggery",
      "Salt",
      "Spices",
      "Dry Fruits",
      "Flour & Sooji"
    ]
  },
  {
    category: "Snacks & Packaged Food",
    subcategories: [
      "Chips",
      "Namkeen",
      "Instant Noodles",
      "Pasta",
      "Ready to Eat",
      "Soup Mix",
      "Breakfast Cereals",
      "Energy Bars"
    ]
  },
  {
    category: "Beverages",
    subcategories: [
      "Soft Drinks",
      "Fruit Juices",
      "Energy Drinks",
      "Tea",
      "Coffee",
      "Health Drinks",
      "Flavoured Milk"
    ]
  },
  {
    category: "Confectionery",
    subcategories: [
      "Chocolates",
      "Candies",
      "Lollipops",
      "Chewing Gum",
      "Toffees",
      "Jelly & Marshmallow"
    ]
  },
  {
    category: "Personal Care",
    subcategories: [
      "Soap",
      "Shampoo",
      "Conditioner",
      "Face Wash",
      "Toothpaste",
      "Toothbrush",
      "Hair Oil",
      "Deodorant",
      "Perfume"
    ]
  },
  {
    category: "Household & Cleaning",
    subcategories: [
      "Floor Cleaner",
      "Dishwash Liquid",
      "Detergent Powder",
      "Detergent Liquid",
      "Toilet Cleaner",
      "Glass Cleaner",
      "Garbage Bags"
    ]
  },
  {
    category: "Baby Care",
    subcategories: [
      "Baby Food",
      "Baby Diapers",
      "Baby Wipes",
      "Baby Lotion",
      "Baby Soap",
      "Baby Shampoo"
    ]
  },
  {
    category: "Frozen Foods",
    subcategories: [
      "Frozen Vegetables",
      "Frozen Snacks",
      "Ice Cream",
      "Frozen Chicken",
      "Frozen Paratha"
    ]
  },
  {
    category: "Ready to Cook",
    subcategories: [
      "Instant Mix",
      "Frozen Snacks",
      "Ready Masala",
      "Ready Curry Mix"
    ]
  },
  {
    category: "Health & Organic",
    subcategories: [
      "Organic Food",
      "Gluten Free Food",
      "Millet Products",
      "Protein Powder",
      "Diet Food"
    ]
  },
  {
    category: "Kitchen Essentials",
    subcategories: [
      "Aluminium Foil",
      "Cling Wrap",
      "Tissue Paper",
      "Paper Napkins",
      "Disposable Plates",
      "Disposable Cups"
    ]
  },
  {
    category: "Pet Care",
    subcategories: [
      "Dog Food",
      "Cat Food",
      "Pet Snacks",
      "Pet Shampoo"
    ]
  }
];

const seedCategories = async () => {
    console.log("🌱 Seeding Supermarket Categories...");
    const connection = db.promise();
    
    try {
        for (let i = 0; i < supermarketCategories.length; i++) {
            const item = supermarketCategories[i];
            const catId = `CAT${(i + 1).toString().padStart(3, '0')}`;
            const subcategoriesJson = JSON.stringify(item.subcategories);
            
            // Using placeholder image if none provided
            const image = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.category)}&background=random&color=fff&size=512`;
            
            console.log(`📡 Adding category: ${item.category} (${catId})...`);
            
            await connection.query(
                `INSERT INTO categories (catId, name, image, description, subcategories) 
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 name = VALUES(name), 
                 subcategories = VALUES(subcategories)`,
                [catId, item.category, image, `Premium collection for ${item.category}`, subcategoriesJson]
            );
        }
        
        console.log("✨ Seeding complete! Added/Updated 14 categories.");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await db.end();
        process.exit();
    }
};

seedCategories();
