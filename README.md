# QR-Based Cafeteria Ordering System

Customer → Table QR → Digital Menu → Cart → Order → Cashier (real-time) → Kitchen → Waiter → Table

Two independently deployable apps:

```
qr-cafeteria-ordering/
├── server/     Next.js App Router — serverless API routes, deploys on Vercel
└── client/     React (Vite) — customer + cashier UI, deploys on Vercel
```

## Architecture at a glance

- **Server = Next.js, API routes only** (`app/api/**`), no pages beyond a
  health-check landing screen. Every route is a Vercel serverless
  function. There is deliberately no long-running Node process anymore.
- **Database = MongoDB**, connected with a cached connection (`src/lib/db.js`)
  so repeated serverless invocations don't exhaust your connection pool.
  **You need MongoDB Atlas (or another hosted Mongo)** — a serverless
  function can't reach a database on your own laptop.
- **Real-time = Pusher, not Socket.io.** This is an important, deliberate
  change: Vercel serverless functions are stateless and short-lived, so
  they cannot hold open WebSocket connections the way the old Express +
  Socket.io server did. Pusher (a managed pub/sub service) replaces that
  role — the API triggers events on it after writing to the database, and
  both the customer and cashier browsers subscribe directly to Pusher.
  Free tier (200k messages/day, 100 concurrent connections) comfortably
  covers a single cafeteria.
- **Accounts are created through the app, not seeded into production.**
  See "Creating your first account" below — no default/hardcoded
  production credentials exist anywhere in this codebase.

## 1. Local development

### 1a. Server

```bash
cd server
npm install
cp .env.example .env.local
```

For local dev you can point `MONGO_URI` at a local MongoDB instance, or
just use a free Atlas cluster for dev too (simpler, one less thing to
install). Fill in `JWT_SECRET`, `SETUP_SECRET`, and Pusher dev credentials
(a free Pusher app works fine for local dev — see step 3 below for how to
create one; you'll reuse the same steps).

```bash
npm run dev        # http://localhost:5000
```

Create the first admin account from the client cashier login screen using
the `SETUP_SECRET` value configured on the server. Tables and menu data must
be created separately with the scripts and admin APIs described below.

### 1b. Client

```bash
cd client
npm install
cp .env.example .env
npm run dev   # http://localhost:5173
```

### 1c. Generate table QR codes

```bash
cd server
npm run generate:qrs
```

Prints scannable QR codes to your terminal and saves PNGs to
`server/qr-output/`.

---

## 2. Deploying to production — overview

You will create **three** accounts/services and **two** Vercel projects:

1. MongoDB Atlas (free tier) — the database
2. Pusher (free tier) — real-time events
3. Vercel — hosts both the `server` and `client` as **separate projects**
   from the same repository

Order matters a bit because the two Vercel projects need each other's
URLs. Follow the steps in order.

### Step 1 — MongoDB Atlas

1. Create a free account at mongodb.com/atlas and a free **M0** cluster.
2. Under **Database Access**, create a database user with a strong password.
3. Under **Network Access**, add `0.0.0.0/0` (allow access from anywhere).
   This is necessary because Vercel serverless functions run on dynamic
   IPs — you can't whitelist a fixed IP. (Rely on your strong DB password
   and Atlas's built-in TLS for security, not IP restriction.)
4. Click **Connect → Drivers**, copy the connection string. It looks like:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/qr_cafeteria`
   — make sure you add a database name (`qr_cafeteria` above) before the `?`.

### Step 2 — Pusher

1. Create a free account at pusher.com → **Channels** product.
2. Create an app, choose the cluster closest to your users (e.g. `ap2` for
   South/Southeast Asia).
3. Open **App Keys** — you'll need all four values (`app_id`, `key`,
   `secret`, `cluster`) for the server, and just `key` + `cluster` (public,
   safe to expose) for the client.

### Step 3 — Deploy the server to Vercel

1. Push this repo to GitHub (or GitLab/Bitbucket).
2. In Vercel, **Add New → Project**, import the repo.
3. **Root Directory: `server`** (important — this tells Vercel to treat
   just this folder as the project).
4. Framework preset: Next.js (auto-detected).
5. Add environment variables (Project Settings → Environment Variables):

   | Variable | Value |
   |---|---|
   | `MONGO_URI` | your Atlas connection string from Step 1 |
   | `JWT_SECRET` | a long random string (e.g. `openssl rand -hex 32`) |
   | `SETUP_SECRET` | another long random string — you'll use this once |
   | `CLIENT_URL` | `http://localhost:5173` for now — **you'll update this in Step 5** |
   | `PUSHER_APP_ID` | from Step 2 |
   | `PUSHER_KEY` | from Step 2 |
   | `PUSHER_SECRET` | from Step 2 |
   | `PUSHER_CLUSTER` | from Step 2, e.g. `ap2` |

6. Deploy. Note the resulting URL, e.g. `https://qr-cafeteria-server.vercel.app`.
7. Visit `https://<your-server>.vercel.app/api/health` — you should see
   `{"success":true,"data":{"status":"ok",...}}`. If you see a 500, double
   check `MONGO_URI` first (by far the most common issue).

### Step 4 — Deploy the client to Vercel

1. Back in Vercel, **Add New → Project**, import the **same repo again**.
2. **Root Directory: `client`**.
3. Framework preset: Vite (auto-detected).
4. Environment variables:

   | Variable | Value |
   |---|---|
   | `VITE_API_URL` | `https://<your-server>.vercel.app/api` (from Step 3) |
   | `VITE_PUSHER_KEY` | from Step 2 |
   | `VITE_PUSHER_CLUSTER` | from Step 2 |

5. Deploy. Note the resulting URL, e.g. `https://qr-cafeteria-client.vercel.app`.

### Step 5 — Close the loop: tell the server about the client

Now that you know the client's real URL:

1. Go back to the **server** Vercel project → Settings → Environment Variables.
2. Update `CLIENT_URL` to your client's exact URL from Step 4 (no trailing
   slash). You can list more than one origin comma-separated if you also
   want local dev to keep working against the deployed API, e.g.:
   `http://localhost:5173,https://qr-cafeteria-client.vercel.app`
3. Redeploy the server project (Vercel → Deployments → ⋯ → Redeploy) so
   the new CORS origin takes effect.

### Step 6 — Create your first admin account

No credentials are pre-seeded in production. Call the one-time setup
endpoint yourself:

```bash
curl -X POST https://<your-server>.vercel.app/api/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "username": "admin",
    "password": "choose-a-strong-password",
    "setupSecret": "the-SETUP_SECRET-value-you-set-in-step-3"
  }'
```

This only works once — the moment an admin account exists, this endpoint
starts returning `409` permanently. If you want extra safety afterward,
you can rotate/remove `SETUP_SECRET` (it's no longer used once setup is
complete).

### Step 7 — Sign in and create additional staff

Go to `https://<your-client>.vercel.app/cashier/login` and sign in with
the account you just created. To add cashier accounts, call the
admin-only register endpoint (there's no admin UI for this yet — see
"Known gaps" below):

```bash
curl -X POST https://<your-server>.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your admin JWT from logging in>" \
  -d '{
    "name": "Cashier Name",
    "username": "cashier1",
    "password": "another-strong-password",
    "role": "cashier"
  }'
```

(Get the JWT from your browser's dev tools → Application → Local Storage
→ `staffToken`, after logging into the client.)

### Step 8 — Create tables (and their QR codes)

Easiest option — run the QR script locally, pointed at production:

```bash
cd server
MONGO_URI="<your Atlas URI>" PUBLIC_CLIENT_URL="https://<your-client>.vercel.app" npm run generate:qrs
```

This creates the table documents directly in your production database and
prints/saves QR codes that point at your live client URL — ready to print
and stick on tables.

### Step 9 — Add your real menu

Either:
- Manually via the admin API (`POST /api/menu/categories`, then
  `POST /api/menu/items` with each item's `category` id — same
  `Authorization: Bearer <admin JWT>` header as Step 7), or
- Once you have Blink API credentials for Jazeera Foods, set
  `BLINK_USERNAME` / `BLINK_PASSWORD` as env vars and run
  `MONGO_URI="<atlas uri>" npm run import:menu` locally — see
  `server/src/scraper/README.md` for why this needs real credentials and
  can't be scraped from the public website directly.

### Step 10 — Test the full production flow

1. Scan a printed QR (or open its URL) → browse the real menu → add to cart → place order.
2. On another device/tab, sign in to the cashier dashboard.
3. Confirm the order appears **instantly** (Pusher, not a page refresh).
4. Advance status, print a receipt, confirm the customer's screen updates live.
5. Test the Call Waiter button the same way.

---

## Costs at this scale

For a single small cafeteria, everything above fits comfortably in free
tiers: Vercel Hobby (both projects), MongoDB Atlas M0, Pusher's free
Channels plan. You'd only need to pay if traffic grows well beyond a
single-location cafeteria (many concurrent tables/orders, or you want
Vercel's paid features like team seats).

## Useful scripts

| Location | Script | What it does |
|---|---|---|
| server | `npm run dev` | Local Next.js dev server (API only) |
| server | `npm run build` / `start` | Production build / run (Vercel does this for you) |
| server | `npm run generate:qrs` | Print + save table QR codes (works against local or Atlas DB) |
| server | `npm run import:menu` | Import the live menu from Blink (needs credentials) |
| client | `npm run dev` | Local Vite dev server |
| client | `npm run build` | Production build (Vercel does this for you) |

## What's implemented (MVP)

- Table-scoped QR → digital menu, no manual table entry
- Category browsing, search, item detail view with ingredients/allergens
- Cart, quantity editing, order notes
- Server-side price/availability validation (client never sets prices)
- Order placement → real-time delivery to cashier dashboard (Pusher)
- Order status lifecycle: pending → confirmed → preparing → ready → completed/cancelled
- Live order status shown back to the customer
- Call Waiter → instant staff notification with table number
- Cashier login (JWT); production account creation via one-time setup +
  admin-gated registration (no seeded credentials)
- Receipt printing (browser + print-CSS, thermal-friendly)
- Menu/category/table CRUD API (admin role) — no admin UI yet, see below
- CORS configured for the client/server split across two Vercel domains

## Known gaps / what's next (not yet built)

- **Admin UI** for menu/table/staff management — the API exists (menu,
  tables, register) but there's no screen for it; use `curl`/Postman for
  now, as shown above
- **Kitchen-specific view** — currently the cashier dashboard also drives
  kitchen status; a dedicated kitchen screen is a straightforward
  follow-up using the same order data and Pusher channel
- **Real Jazeera menu import** — blocked on Blink credentials (see
  `server/src/scraper/README.md`)
- **Payment integration, inventory, analytics** — explicitly out of MVP
  scope per the project brief

## Architecture notes

- Order totals are always computed server-side from the current database
  price — the client never sends a price it can be trusted for.
- Each order item stores a *snapshot* of name/price, so historical orders
  don't change if the menu is edited later.
- Pusher channels: staff dashboards subscribe to `staff-channel`; each
  customer's order-confirmation screen subscribes to `table-<number>` so
  status updates can be targeted without every customer receiving every
  event.
- QR codes encode `/menu/t/<random-token>`, not the raw table number —
  tokens can be regenerated per-table via the admin API without changing
  the table's identity in the database.
- `server/middleware.js` is the single place CORS is handled for every
  `/api/*` route — if you add a new client origin, update `CLIENT_URL` in
  the server's Vercel env vars rather than touching individual routes.
