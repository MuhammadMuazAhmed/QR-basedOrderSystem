import { login } from '../../../../src/controllers/authController';

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const req = { body };
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
    await login(req, res, () => {});
    return Response.json(res.jsonPayload || { success: true, data: null }, { status: res.statusCode || 200 });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message || 'Login failed' },
      { status: error.statusCode || 500 }
    );
  }
}
