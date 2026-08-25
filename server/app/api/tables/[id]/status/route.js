import { setStatus } from '../../../../../src/controllers/tableController';
import { runExpressController } from '../../../../../src/lib/nextApiAdapter';

export async function PATCH(request, { params }) {
  const result = await runExpressController(setStatus, request, params);
  return Response.json(result.payload, { status: result.status });
}
