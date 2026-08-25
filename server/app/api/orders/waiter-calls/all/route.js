import { listWaiterCalls } from '../../../../../src/controllers/orderController';
import { runExpressController } from '../../../../../src/lib/nextApiAdapter';

export async function GET(request) {
  const result = await runExpressController(listWaiterCalls, request);
  return Response.json(result.payload, { status: result.status });
}
