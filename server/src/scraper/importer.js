/**
 * Imports the live menu from Jazeera Foods' Blink ordering backend.
 * Requires BLINK_USERNAME / BLINK_PASSWORD in server/.env — see README.md
 * in this folder for why, and what to do if you don't have them yet.
 *
 * Run with: npm run import:menu
 */
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const { login, fetchCategories, fetchAllMenuItems } = require('./blinkClient');
const { transformCategory, transformMenuItem } = require('./transformer');

async function main() {
  await connectDB();

  console.log('[import] logging in to Blink...');
  const token = await login();

  console.log('[import] fetching categories...');
  const blinkCategories = await fetchCategories(token);

  const categoryIdBySlug = new Map();
  for (const [index, blinkCategory] of blinkCategories.entries()) {
    const shaped = transformCategory(blinkCategory, index);
    const category = await Category.findOneAndUpdate(
      { slug: shaped.slug },
      shaped,
      { upsert: true, new: true }
    );
    categoryIdBySlug.set(shaped.slug, category._id);
  }
  console.log(`[import] upserted ${blinkCategories.length} categories`);

  console.log('[import] fetching menu items (paginated)...');
  const blinkItems = await fetchAllMenuItems(token);

  let created = 0;
  let updated = 0;
  for (const blinkItem of blinkItems) {
    const shaped = transformMenuItem(blinkItem, categoryIdBySlug);
    if (!shaped.category) {
      console.warn(`[import] skipping "${shaped.name}" — no matching category`);
      continue;
    }
    const result = await MenuItem.findOneAndUpdate(
      { sourceItemId: shaped.sourceItemId, source: 'blink-import' },
      shaped,
      { upsert: true, new: true, rawResult: true }
    );
    if (result.lastErrorObject?.updatedExisting) updated += 1;
    else created += 1;
  }

  console.log(`[import] done — ${created} new items, ${updated} updated (${blinkItems.length} total)`);
  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('[import] failed:', err.message);
  console.error('[import] See server/src/scraper/README.md for setup help.');
  process.exit(1);
});
