/**
 * Dev utility — generates (or reuses) table tokens and prints scannable
 * QR codes straight to the terminal, plus saves PNG files you can open.
 *
 * Run with: npm run generate:qrs
 */
const path = require('path');
const fs = require('fs');
const qrcodeTerminal = require('qrcode-terminal');
const QRCode = require('qrcode');
const { nanoid } = require('nanoid');
const mongoose = require('mongoose');

const connectDB = require('../config/db');
const Table = require('../models/Table');
const { tableCount, publicClientUrl } = require('../config/env');

async function ensureTables() {
  const existing = await Table.find({}).sort({ tableNumber: 1 });
  const existingNumbers = new Set(existing.map((t) => t.tableNumber));

  const toCreate = [];
  for (let n = 1; n <= tableCount; n += 1) {
    if (!existingNumbers.has(n)) {
      toCreate.push({ tableNumber: n, token: nanoid(12) });
    }
  }
  if (toCreate.length) {
    await Table.insertMany(toCreate);
  }
  return Table.find({}).sort({ tableNumber: 1 });
}

async function main() {
  await connectDB();
  const tables = await ensureTables();

  const outDir = path.join(__dirname, '..', '..', 'qr-output');
  fs.mkdirSync(outDir, { recursive: true });

  console.log('\n========================================');
  console.log('QR CODES GENERATED');
  console.log('========================================\n');

  for (const table of tables) {
    const url = `${publicClientUrl}/menu/t/${table.token}`;
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
  console.log(`${tables.length} table QR codes ready.`);
  console.log(`PNG files saved to: ${outDir}`);
  console.log('Scan one with your phone (same Wi-Fi network) to test the flow.');
  console.log('If testing on a real phone, set PUBLIC_CLIENT_URL in .env to');
  console.log('your computer\'s LAN IP, e.g. http://192.168.1.10:5173');
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error('[generate:qrs] failed:', err);
  process.exit(1);
});
