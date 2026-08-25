import { getOrder, updateOrderStatus } from '../../../../src/controllers/orderController';
import { runExpressController } from '../../../../src/lib/nextApiAdapter';

export async function GET(request, { params }) {
  const result = await runExpressController(getOrder, request, params);
  return Response.json(result.payload, { status: result.status });
}

export async function PATCH(request, { params }) {
  const result = await runExpressController(updateOrderStatus, request, params);
  return Response.json(result.payload, { status: result.status });
}
