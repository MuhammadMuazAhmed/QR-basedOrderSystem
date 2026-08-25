/**
 * Seeds development data so the full order flow can be tested immediately:
 *   - Menu categories + PLACEHOLDER menu items
 *   - `tableCount` tables (same as generate:qrs would create)
 *   - One admin and one cashier staff account
 *
 * IMPORTANT: The menu items below are placeholder/sample data reflecting
 * the general style of cuisine Jazeera Foods serves (Pakistani/Middle-
 * Eastern — BBQ, karahi, biryani, shawarma). They are NOT scraped from
 * jazeerafoods.com. See server/src/scraper/README.md for why, and run
 * `npm run import:menu` once you have Blink API credentials from Jazeera
 * to replace this with their real menu, prices, and images.
 *
 * Run with: npm run seed
 */
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');

const connectDB = require('../config/db');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');
const StaffUser = require('../models/StaffUser');
const { tableCount } = require('../config/env');

const categories = [
  { name: 'BBQ & Grills', slug: 'bbq-grills', sortOrder: 1 },
  { name: 'Shawarma & Wraps', slug: 'shawarma-wraps', sortOrder: 2 },
  { name: 'Rice & Biryani', slug: 'rice-biryani', sortOrder: 3 },
  { name: 'Karahi & Curries', slug: 'karahi-curries', sortOrder: 4 },
  { name: 'Beverages', slug: 'beverages', sortOrder: 5 },
  { name: 'Desserts', slug: 'desserts', sortOrder: 6 },
];

// [PLACEHOLDER] sample dev menu — replace via `npm run import:menu`
const itemsByCategorySlug = {
  'bbq-grills': [
    { name: 'Seekh Kabab (6 pcs)', price: 650, description: 'Char-grilled minced beef skewers with house spices.', ingredients: ['Beef', 'Onion', 'Green chili', 'Spices'], allergens: [] },
    { name: 'Chicken Tikka (Half)', price: 550, description: 'Bone-in chicken marinated overnight, chargrilled.', ingredients: ['Chicken', 'Yogurt', 'Spices'], allergens: ['Dairy'] },
    { name: 'Beef Boti Platter', price: 900, description: 'Tender beef cubes, grilled and served with salad.', ingredients: ['Beef', 'Spices'], allergens: [] },
  ],
  'shawarma-wraps': [
    { name: 'Chicken Shawarma Roll', price: 320, description: 'Sliced chicken, garlic sauce, pickles, wrapped in Arabic bread.', ingredients: ['Chicken', 'Garlic sauce', 'Pickles', 'Arabic bread'], allergens: ['Gluten'] },
    { name: 'Beef Shawarma Roll', price: 350, description: 'Slow-roasted beef shawarma with tahini and vegetables.', ingredients: ['Beef', 'Tahini', 'Vegetables', 'Arabic bread'], allergens: ['Gluten', 'Sesame'] },
    { name: 'Shawarma Platter', price: 780, description: 'Shawarma meat, rice, salad, garlic sauce, and pickles.', ingredients: ['Chicken or beef', 'Rice', 'Salad', 'Garlic sauce'], allergens: [] },
  ],
  'rice-biryani': [
    { name: 'Chicken Biryani', price: 380, description: 'Classic layered rice with spiced chicken and raita.', ingredients: ['Rice', 'Chicken', 'Spices', 'Yogurt'], allergens: ['Dairy'] },
    { name: 'Beef Pulao', price: 420, description: 'Fragrant rice cooked in beef stock with whole spices.', ingredients: ['Rice', 'Beef', 'Spices'], allergens: [] },
    { name: 'Mandi Rice with Chicken', price: 650, description: 'Slow-cooked spiced rice topped with roasted chicken.', ingredients: ['Rice', 'Chicken', 'Spices'], allergens: [] },
  ],
  'karahi-curries': [
    { name: 'Chicken Karahi (Half)', price: 950, description: 'Tomato-based chicken karahi cooked in traditional style.', ingredients: ['Chicken', 'Tomato', 'Ginger', 'Garlic'], allergens: [] },
    { name: 'Chicken Makhni Karahi', price: 1050, description: 'Rich, buttery tomato-cream chicken karahi.', ingredients: ['Chicken', 'Butter', 'Cream', 'Tomato'], allergens: ['Dairy'] },
    { name: 'Daal Mash', price: 280, description: 'Slow-cooked black lentils finished with cream.', ingredients: ['Lentils', 'Cream', 'Spices'], allergens: ['Dairy'] },
  ],
  beverages: [
    { name: 'Fresh Mango Juice', price: 220, description: 'Seasonal mango blended fresh to order.', ingredients: ['Mango'], allergens: [] },
    { name: 'Soft Drink (Can)', price: 100, description: 'Chilled 330ml can.', ingredients: [], allergens: [] },
    { name: 'Mint Lemonade', price: 180, description: 'Fresh lemon and mint, lightly sweetened.', ingredients: ['Lemon', 'Mint', 'Sugar'], allergens: [] },
  ],
  desserts: [
    { name: 'Kunafa (Slice)', price: 350, description: 'Warm cheese pastry soaked in sugar syrup.', ingredients: ['Semolina', 'Cheese', 'Sugar syrup'], allergens: ['Dairy', 'Gluten'] },
    { name: 'Gulab Jamun (2 pcs)', price: 150, description: 'Soft milk-solid dumplings in rose-scented syrup.', ingredients: ['Milk solids', 'Sugar syrup'], allergens: ['Dairy'] },
  ],
};

async function seedStaff() {
  const existingAdmin = await StaffUser.findOne({ username: 'admin' });
  if (!existingAdmin) {
    await StaffUser.create({
      name: 'Admin',
      username: 'admin',
      passwordHash: await StaffUser.hashPassword('admin123'),
      role: 'admin',
    });
    console.log('[seed] created admin account -> username: admin / password: admin123');
  }

  const existingCashier = await StaffUser.findOne({ username: 'cashier' });
  if (!existingCashier) {
    await StaffUser.create({
      name: 'Cashier',
      username: 'cashier',
      passwordHash: await StaffUser.hashPassword('cashier123'),
      role: 'cashier',
    });
    console.log('[seed] created cashier account -> username: cashier / password: cashier123');
  }
}

async function seedTables() {
  const existing = await Table.find({});
  const existingNumbers = new Set(existing.map((t) => t.tableNumber));
  const toCreate = [];
  for (let n = 1; n <= tableCount; n += 1) {
    if (!existingNumbers.has(n)) toCreate.push({ tableNumber: n, token: nanoid(12) });
  }
  if (toCreate.length) {
    await Table.insertMany(toCreate);
    console.log(`[seed] created ${toCreate.length} tables (total target: ${tableCount})`);
  } else {
    console.log('[seed] tables already exist, skipping');
  }
}

async function seedMenu() {
  const existingCount = await MenuItem.countDocuments();
  if (existingCount > 0) {
    console.log('[seed] menu items already exist, skipping (delete the collection to reseed)');
    return;
  }

  for (const cat of categories) {
    const category = await Category.findOneAndUpdate(
      { slug: cat.slug },
      cat,
      { upsert: true, new: true }
    );

    const items = itemsByCategorySlug[cat.slug] || [];
    for (const item of items) {
      await MenuItem.create({
        ...item,
        category: category._id,
        source: 'placeholder',
        image: '', // no image URL — the client shows a styled placeholder instead
      });
    }
  }
  console.log('[seed] created placeholder categories + menu items');
}

async function main() {
  await connectDB();
  await seedStaff();
  await seedTables();
  await seedMenu();
  console.log('\n[seed] Done. Run "npm run generate:qrs" to print/save QR codes for testing.\n');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
