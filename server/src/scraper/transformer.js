function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Blink category (from GET /categories) -> our Category shape
function transformCategory(blinkCategory, index) {
  return {
    name: blinkCategory.name,
    slug: slugify(blinkCategory.name) || `category-${blinkCategory.blink_id || index}`,
    sortOrder: index,
    active: blinkCategory.status === 1,
  };
}

// Blink menu item (from GET /fetchMenu) -> our MenuItem shape.
// Blink nests category + branch pricing; we take the first category and
// the first branch price if present, otherwise the item's base price.
function transformMenuItem(blinkItem, categoryIdBySlug) {
  const categorySlug = slugify(blinkItem.category?.[0]?.name || 'uncategorized');
  const categoryId = categoryIdBySlug.get(categorySlug);

  const branchPrice = blinkItem.branches?.[0]?.price;
  const price = Number(branchPrice ?? blinkItem.price ?? 0);

  return {
    name: blinkItem.name,
    description: '', // Blink's fetchMenu response doesn't include a description field
    price,
    image: blinkItem.img_url || '',
    category: categoryId,
    ingredients: [],
    allergens: [],
    available: blinkItem.branches?.[0]?.is_active !== false,
    source: 'blink-import',
    sourceItemId: String(blinkItem.id),
  };
}

module.exports = { slugify, transformCategory, transformMenuItem };
