import { resolveWaiterCall } from '../../../../../../src/controllers/orderController';
import { runExpressController } from '../../../../../../src/lib/nextApiAdapter';

export async function PATCH(request, { params }) {
  const result = await runExpressController(resolveWaiterCall, request, params);
  return Response.json(result.payload, { status: result.status });
}
