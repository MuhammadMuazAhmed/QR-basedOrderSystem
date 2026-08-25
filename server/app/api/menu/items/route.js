import { createMenuItem } from '../../../../src/controllers/menuController';
import { runExpressController } from '../../../../src/lib/nextApiAdapter';

export async function POST(request) {
  const result = await runExpressController(createMenuItem, request);
  return Response.json(result.payload, { status: result.status });
}
