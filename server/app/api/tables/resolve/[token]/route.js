import { connectDB } from '@/src/lib/db';
import Table from '@/src/models/Table';
import { ok, ApiError, withHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

// GET /api/tables/resolve/:token — public, called right after a QR scan
export const GET = withHandler(async (req, { params }) => {
  await connectDB();
  const table = await Table.findOne({ token: params.token });
  if (!table) throw new ApiError(404, 'Invalid or unknown table QR code');
  if (table.status !== 'active') throw new ApiError(409, 'This table is currently inactive. Please ask staff for help.');
  return ok(table);
});
