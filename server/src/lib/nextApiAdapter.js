export async function runExpressController(controller, request, params = {}, initialBody) {
  const url = new URL(request.url, 'http://localhost');
  const body =
    initialBody ??
    (request.method === 'GET' || request.method === 'HEAD' ? {} : await readJsonBody(request));

  const req = {
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    query: Object.fromEntries(url.searchParams.entries()),
    params,
    body,
    url: url.pathname,
    cookies: Object.fromEntries(
      (request.headers.get('cookie') || '')
        .split(';')
        .map((item) => item.trim())
        .filter(Boolean)
        .map((item) => {
          const idx = item.indexOf('=');
          const key = idx >= 0 ? item.slice(0, idx) : item;
          const value = idx >= 0 ? item.slice(idx + 1) : '';
          return [key, value];
        })
    ),
  };

  const res = createMockResponse();

  await new Promise((resolve, reject) => {
    Promise.resolve(controller(req, res, (err) => (err ? reject(err) : resolve()))).catch(reject);
  });

  return {
    status: res.statusCode || 200,
    payload: res.payload ?? { success: true, data: null },
  };
}

function createMockResponse() {
  return {
    statusCode: 200,
    payload: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.payload = data;
      return this;
    },
    send(data) {
      this.payload = data;
      return this;
    },
    end(data) {
      this.payload = data;
      return this;
    },
    setHeader() {},
  };
}

async function readJsonBody(request) {
  try {
    const text = await request.text();
    if (!text) return {};
    return JSON.parse(text);
  } catch {
    return {};
  }
}
