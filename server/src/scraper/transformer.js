export function slugify(str) {
  return String(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function transformCategory(blinkCategory, index) {
  return {
    name: blinkCategory.name,
    slug: slugify(blinkCategory.name) || `category-${blinkCategory.blink_id || index}`,
    sortOrder: index,
    active: blinkCategory.status === 1,
  };
}

export function transformMenuItem(blinkItem, categoryIdBySlug) {
  const categorySlug = slugify(blinkItem.category?.[0]?.name || 'uncategorized');
  const categoryId = categoryIdBySlug.get(categorySlug);

  const branchPrice = blinkItem.branches?.[0]?.price;
  const price = Number(branchPrice ?? blinkItem.price ?? 0);

  return {
    name: blinkItem.name,
    description: '',
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
