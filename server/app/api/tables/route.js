import { listTables, createTable } from '../../../src/controllers/tableController';
import { runExpressController } from '../../../src/lib/nextApiAdapter';

export async function GET(request) {
  const result = await runExpressController(listTables, request);
  return Response.json(result.payload, { status: result.status });
}

export async function POST(request) {
  const result = await runExpressController(createTable, request);
  return Response.json(result.payload, { status: result.status });
}
