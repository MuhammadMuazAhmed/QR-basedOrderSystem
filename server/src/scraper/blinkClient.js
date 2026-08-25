const { blink } = require('../config/env');

async function login() {
  if (!blink.username || !blink.password) {
    throw new Error(
      'BLINK_USERNAME / BLINK_PASSWORD are not set in server/.env — see server/src/scraper/README.md'
    );
  }

  const res = await fetch(`${blink.baseUrl}/interface/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: blink.username, password: blink.password }),
  });

  if (!res.ok) {
    throw new Error(`Blink login failed: ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function fetchCategories(token) {
  const res = await fetch(`${blink.baseUrl}/interface/v1/categories`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Fetch categories failed: ${res.status}`);
  const json = await res.json();
  return json.data || [];
}

// Blink paginates fetchMenu — walk every page and return the combined list.
async function fetchAllMenuItems(token) {
  let page = 1;
  let lastPage = 1;
  const all = [];

  do {
    const res = await fetch(`${blink.baseUrl}/interface/v1/fetchMenu?page=${page}`, {
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

module.exports = { login, fetchCategories, fetchAllMenuItems };
