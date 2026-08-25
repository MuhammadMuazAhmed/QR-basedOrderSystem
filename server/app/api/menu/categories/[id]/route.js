import { updateCategory, deleteCategory } from '../../../../../src/controllers/menuController';
import { runExpressController } from '../../../../../src/lib/nextApiAdapter';

export async function PATCH(request, { params }) {
  const result = await runExpressController(updateCategory, request, params);
  return Response.json(result.payload, { status: result.status });
}

export async function DELETE(request, { params }) {
  const result = await runExpressController(deleteCategory, request, params);
  return Response.json(result.payload, { status: result.status });
}
