import { ok, withHandler } from '@/src/lib/apiHandler';
import { requireAuth } from '@/src/lib/auth';

export const dynamic = 'force-dynamic';

export const GET = withHandler(async (req) => {
  const staff = requireAuth(req);
  return ok(staff);
});
