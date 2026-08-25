import { callWaiter } from '../../../../src/controllers/orderController';
import { runExpressController } from '../../../../src/lib/nextApiAdapter';

export async function POST(request) {
  const result = await runExpressController(callWaiter, request);
  return Response.json(result.payload, { status: result.status });
}
