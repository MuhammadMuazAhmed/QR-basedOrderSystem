import { createOrder, listOrders } from '../../../src/controllers/orderController';
import { runExpressController } from '../../../src/lib/nextApiAdapter';

export async function POST(request) {
  const result = await runExpressController(createOrder, request);
  return Response.json(result.payload, { status: result.status });
}

export async function GET(request) {
  const result = await runExpressController(listOrders, request);
  return Response.json(result.payload, { status: result.status });
}
