import { getMenuItem } from '../../../../../src/controllers/menuController';
import { runExpressController } from '../../../../../src/lib/nextApiAdapter';

export async function GET(request, { params }) {
  const result = await runExpressController(getMenuItem, request, params);
  return Response.json(result.payload, { status: result.status });
}
