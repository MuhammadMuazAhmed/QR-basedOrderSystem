import { ok, withHandler } from '@/src/lib/apiHandler';

export const dynamic = 'force-dynamic';

export const GET = withHandler(async () => {
  return ok({ status: 'ok', time: new Date().toISOString() });
});
