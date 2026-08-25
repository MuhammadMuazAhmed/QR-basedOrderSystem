export async function dispatchController(controller, req, params = {}) {
  const url = new URL(req.url, 'http://localhost');
  const body = req.method === 'GET' || req.method === 'HEAD' ? {} : await readJsonBody(req);

  const expressReq = {
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
    query: Object.fromEntries(url.searchParams.entries()),
    params,
    body,
    url: url.pathname,
  };

  const response = { statusCode: 200, payload: null };
  const res = {
    status(code) {
      response.statusCode = code;
      return this;
    },
    json(data) {
      response.payload = data;
      return this;
    },
    send(data) {
      response.payload = data;
      return this;
    },
    setHeader() {},
    end(data) {
      response.payload = data;
      return this;
    },
  };

  await controller(expressReq, res, (err) => {
    if (err) throw err;
  });

  return {
    status: response.statusCode,
    payload: response.payload ?? { success: true, data: null },
  };
}

async function readJsonBody(req) {
  try {
    const text = await req.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}
