import { connectDB } from '@/src/lib/db';
import Category from '@/src/models/Category';
import { ok, ApiError, withHandler } from '@/src/lib/apiHandler';
import { requireAuth, requireRole } from '@/src/lib/auth';

export const dynamic = 'force-dynamic';

export const PATCH = withHandler(async (req, { params }) => {
  await connectDB();
  const staff = requireAuth(req);
  requireRole(staff, 'admin');

  const body = await req.json();
  const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
  if (!category) throw new ApiError(404, 'Category not found');
  return ok(category);
});

export const DELETE = withHandler(async (req, { params }) => {
  await connectDB();
  const staff = requireAuth(req);
  requireRole(staff, 'admin');

  const category = await Category.findByIdAndDelete(params.id);
  if (!category) throw new ApiError(404, 'Category not found');
  return ok({ deleted: true });
});
