/**
 * Generates (or reuses) table tokens and prints scannable QR codes to the
 * terminal, plus saves PNG files. Works against whatever MONGO_URI points
 * to — your local dev database, or a production Atlas database if you set
 * MONGO_URI to your production connection string when running this
 * (e.g. `MONGO_URI="<atlas-uri>" PUBLIC_CLIENT_URL="https://your-client.vercel.app" npm run generate:qrs`).
 *
 * Run with: npm run generate:qrs
 */
import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import qrcodeTerminal from 'qrcode-terminal';
import QRCode from 'qrcode';
import { nanoid } from 'nanoid';
import mongoose from 'mongoose';
import { connectDB } from '../lib/db.js';
import Table from '../models/Table.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TABLE_COUNT = Number(process.env.TABLE_COUNT || 10);
const PUBLIC_CLIENT_URL = process.env.PUBLIC_CLIENT_URL || 'http://localhost:5173';

async function ensureTables() {
  const existing = await Table.find({}).sort({ tableNumber: 1 });
  const existingNumbers = new Set(existing.map((t) => t.tableNumber));

  const toCreate = [];
  for (let n = 1; n <= TABLE_COUNT; n += 1) {
    if (!existingNumbers.has(n)) toCreate.push({ tableNumber: n, token: nanoid(12) });
  }
  if (toCreate.length) await Table.insertMany(toCreate);
  return Table.find({}).sort({ tableNumber: 1 });
}

async function main() {
  await connectDB();
  const tables = await ensureTables();

  const outDir = path.join(__dirname, '..', '..', 'qr-output');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('\n========================================');
  console.log('QR CODES GENERATED');
  console.log(`Target: ${PUBLIC_CLIENT_URL}`);
  console.log('========================================\n');

  for (const table of tables) {
    const url = `${PUBLIC_CLIENT_URL}/menu/t/${table.token}`;
    console.log(`Table ${table.tableNumber}`);
    console.log(`URL: ${url}`);

    await new Promise((resolve) => {
      qrcodeTerminal.generate(url, { small: true }, (qr) => {
        console.log(qr);
        resolve();
      });
    });

    const filePath = path.join(outDir, `table-${table.tableNumber}.png`);
    await QRCode.toFile(filePath, url, { width: 400, margin: 2 });
    console.log(`Saved: ${filePath}`);
    console.log('----------------------------------------\n');
  }

  console.log('========================================');
  console.log(`${tables.length} table QR codes ready. PNGs saved to: ${outDir}`);
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('[generate:qrs] failed:', err);
  process.exit(1);
});
