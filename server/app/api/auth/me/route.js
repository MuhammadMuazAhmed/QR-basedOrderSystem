import { requireAuth } from '../../../../src/middleware/auth';

export async function GET(request) {
  const authorization = request.headers.get('authorization');
  const req = { headers: { authorization: authorization || '' } };
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
    await new Promise((resolve, reject) => {
      requireAuth(req, res, (err) => (err ? reject(err) : resolve()));
    });
    return Response.json({ success: true, data: req.staff || null });
  } catch (error) {
    return Response.json(
      { success: false, message: error.message || 'Unauthorized' },
      { status: error.statusCode || 401 }
    );
  }
}
