# Menu Import — Jazeera Foods

## Why this isn't a classic "HTML scraper"

`jazeerafoods.com` is a client-side rendered ordering storefront built on
the **Blink** ordering platform (blinkco.io). The HTML the server sends
down is just an empty app shell — the actual menu, prices, and images are
fetched by the browser at runtime from Blink's API and require a
**merchant-issued username/password** (per Blink's own API docs at
docs.blinkco.io). There is no public, unauthenticated endpoint to pull
the menu from, so a plain HTTP/HTML scraper cannot retrieve real data —
and brute-forcing or guessing credentials is not something this tool will
do.

**What this means practically:** to get Jazeera's real menu, prices and
photos into this system, someone with a relationship to Jazeera Foods
needs to either:

1. Ask Jazeera (or Blink support) for read API credentials for their
   Blink account, **or**
2. Export the menu from Jazeera's Blink merchant dashboard (CSV/JSON) and
   hand it to us, **or**
3. Manually supply the item list (name, price, category, description,
   image) which we import via the same pipeline below.

## What's built and ready to use

`importer.js` in this folder implements the full pipeline already, wired
to Blink's actual documented endpoints (`GET /interface/v1/categories`
and `GET /interface/v1/fetchMenu`, paginated). The moment you have
credentials:

```bash
# in server/.env
BLINK_USERNAME=xxxxx
BLINK_PASSWORD=xxxxx

npm run import:menu
```

It will log in, pull every category and item, transform Blink's shape
into our schema, and upsert it into MongoDB — tagging every imported item
with `source: "blink-import"` and `sourceItemId` so re-running the import
later updates prices/availability without creating duplicates.

## Until then

`npm run seed` populates a small set of **clearly-labeled placeholder**
menu items (`source: "placeholder"`) covering the same style of cuisine,
so you can build/test/demo the entire ordering flow today. Swap them out
with a real `npm run import:menu` run whenever credentials are available
— no code changes needed, the customer/cashier UI reads from the same
`MenuItem` collection either way.
