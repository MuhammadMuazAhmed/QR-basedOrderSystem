import { createCategory } from '../../../../src/controllers/menuController';
import { runExpressController } from '../../../../src/lib/nextApiAdapter';

export async function POST(request) {
  const result = await runExpressController(createCategory, request);
  return Response.json(result.payload, { status: result.status });
}
