/**
 * DEV-ONLY convenience script. Seeds tables + a placeholder menu so you
 * can test the ordering flow locally without touching a production
 * database. Point MONGO_URI at your LOCAL/dev database before running this
 * — do not run it against a production connection string.
 *
 * Staff accounts are intentionally NOT created here. In production you
 * create your first admin via POST /api/auth/setup (see the deployment
 * guide in the root README), which is safer than baked-in seeded
 * credentials. For local dev convenience this script still creates a
 * throwaway dev admin/cashier so you don't have to call /api/auth/setup
 * by hand every time — clearly logged as dev-only below.
 *
 * Run with: npm run seed:dev
 */
import 'dotenv/config';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import { connectDB } from '../lib/db.js';
import Category from '../models/Category.js';
import MenuItem from '../models/MenuItem.js';
import Table from '../models/Table.js';
import StaffUser from '../models/StaffUser.js';

const TABLE_COUNT = Number(process.env.TABLE_COUNT || 10);

const categories = [
  { name: 'BBQ & Grills', slug: 'bbq-grills', sortOrder: 1 },
  { name: 'Shawarma & Wraps', slug: 'shawarma-wraps', sortOrder: 2 },
  { name: 'Rice & Biryani', slug: 'rice-biryani', sortOrder: 3 },
  { name: 'Karahi & Curries', slug: 'karahi-curries', sortOrder: 4 },
  { name: 'Beverages', slug: 'beverages', sortOrder: 5 },
  { name: 'Desserts', slug: 'desserts', sortOrder: 6 },
];

// [PLACEHOLDER] sample dev menu — NOT scraped from jazeerafoods.com.
// See ../scraper notes in the project README for why, and npm run import:menu.
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

async function seedDevStaff() {
  const count = await StaffUser.countDocuments();
  if (count > 0) {
    console.log('[seed:dev] staff accounts already exist, skipping');
    return;
  }
  await StaffUser.create({
    name: 'Dev Admin',
    username: 'admin',
    passwordHash: await StaffUser.hashPassword('admin123'),
    role: 'admin',
  });
  await StaffUser.create({
    name: 'Dev Cashier',
    username: 'cashier',
    passwordHash: await StaffUser.hashPassword('cashier123'),
    role: 'cashier',
  });
  console.log('[seed:dev] DEV-ONLY accounts created -> admin/admin123, cashier/cashier123');
  console.log('[seed:dev] Do NOT rely on this in production — use POST /api/auth/setup instead.');
}

async function seedTables() {
  const existing = await Table.find({});
  const existingNumbers = new Set(existing.map((t) => t.tableNumber));
  const toCreate = [];
  for (let n = 1; n <= TABLE_COUNT; n += 1) {
    if (!existingNumbers.has(n)) toCreate.push({ tableNumber: n, token: nanoid(12) });
  }
  if (toCreate.length) {
    await Table.insertMany(toCreate);
    console.log(`[seed:dev] created ${toCreate.length} tables (target: ${TABLE_COUNT})`);
  } else {
    console.log('[seed:dev] tables already exist, skipping');
  }
}

async function seedMenu() {
  const existingCount = await MenuItem.countDocuments();
  if (existingCount > 0) {
    console.log('[seed:dev] menu items already exist, skipping');
    return;
  }
  for (const cat of categories) {
    const category = await Category.findOneAndUpdate({ slug: cat.slug }, cat, { upsert: true, new: true });
    for (const item of itemsByCategorySlug[cat.slug] || []) {
      await MenuItem.create({ ...item, category: category._id, source: 'placeholder', image: '' });
    }
  }
  console.log('[seed:dev] created placeholder categories + menu items');
}

async function main() {
  if (process.env.NODE_ENV === 'production') {
    console.error('[seed:dev] refusing to run with NODE_ENV=production. This script is for local dev only.');
    process.exit(1);
  }
  await connectDB();
  await seedDevStaff();
  await seedTables();
  await seedMenu();
  console.log('\n[seed:dev] Done. Run "npm run generate:qrs" to print/save QR codes for testing.\n');
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('[seed:dev] failed:', err);
  process.exit(1);
});
