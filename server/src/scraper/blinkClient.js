const BLINK_BASE_URL = process.env.BLINK_BASE_URL || 'https://api.blinkco.io';

export async function login() {
  const username = process.env.BLINK_USERNAME;
  const password = process.env.BLINK_PASSWORD;
  if (!username || !password) {
    throw new Error('BLINK_USERNAME / BLINK_PASSWORD are not set — see src/scraper/README.md');
  }

  const res = await fetch(`${BLINK_BASE_URL}/interface/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) throw new Error(`Blink login failed: ${res.status} ${res.statusText}`);
  const data = await res.json();
  return data.access_token;
}

export async function fetchCategories(token) {
  const res = await fetch(`${BLINK_BASE_URL}/interface/v1/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Fetch categories failed: ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

export async function fetchAllMenuItems(token) {
  let page = 1;
  let lastPage = 1;
  const all = [];

  do {
    const res = await fetch(`${BLINK_BASE_URL}/interface/v1/fetchMenu?page=${page}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error(`Fetch menu failed on page ${page}: ${res.status}`);
    const json = await res.json();
    all.push(...(json.data || []));
    lastPage = json.last_page || 1;
    page += 1;
  } while (page <= lastPage);

  return all;
}
