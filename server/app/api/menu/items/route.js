import { connectDB } from '@/src/lib/db';
import MenuItem from '@/src/models/MenuItem';
import { ok, ApiError, withHandler } from '@/src/lib/apiHandler';
import { requireAuth, requireRole } from '@/src/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/menu/items/:id — public, used by the item detail screen
export const GET = withHandler(async (req, { params }) => {
  await connectDB();
  const item = await MenuItem.findById(params.id).populate('category', 'name slug');
  if (!item) throw new ApiError(404, 'Menu item not found');
  return ok(item);
});

export const PATCH = withHandler(async (req, { params }) => {
  await connectDB();
  const staff = requireAuth(req);
  requireRole(staff, 'admin');

  const body = await req.json();
  const item = await MenuItem.findByIdAndUpdate(params.id, body, { new: true });
  if (!item) throw new ApiError(404, 'Menu item not found');
  return ok(item);
});

export const DELETE = withHandler(async (req, { params }) => {
  await connectDB();
  const staff = requireAuth(req);
  requireRole(staff, 'admin');

  const item = await MenuItem.findByIdAndDelete(params.id);
  if (!item) throw new ApiError(404, 'Menu item not found');
  return ok({ deleted: true });
});
