import { getFullMenu } from '../../../src/controllers/menuController';

export async function GET() {
  const req = {};
  const res = {
    json(payload) {
      return payload;
    },
    status(code) {
      this.statusCode = code;
      return this;
    },
  };

  try {
    await getFullMenu(req, res, () => {});
    return Response.json(res.jsonPayload || { success: true, data: [] }, { status: res.statusCode || 200 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message || 'Failed to load menu' },
      { status: error.statusCode || 500 }
    );
  }
}
