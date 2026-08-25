import { resolveTable } from '../../../../../src/controllers/tableController';
import { runExpressController } from '../../../../../src/lib/nextApiAdapter';

export async function GET(request, { params }) {
  const result = await runExpressController(resolveTable, request, params);
  return Response.json(result.payload, { status: result.status });
}
