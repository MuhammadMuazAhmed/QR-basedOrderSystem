import { regenerateToken } from '../../../../../src/controllers/tableController';
import { runExpressController } from '../../../../../src/lib/nextApiAdapter';

export async function PATCH(request, { params }) {
  const result = await runExpressController(regenerateToken, request, params);
  return Response.json(result.payload, { status: result.status });
}
