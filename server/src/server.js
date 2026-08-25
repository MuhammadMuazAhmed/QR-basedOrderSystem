const connectDB = require('./config/db');
const { initSockets } = require('./sockets');

async function start() {
  console.warn('[legacy] This project is running as a Next.js serverless backend. The old Express HTTP server startup is disabled for Vercel compatibility.');

  await connectDB();
  initSockets();
}

if (require.main === module) {
  start().catch((err) => {
    console.error('[legacy] Startup warning only; serverless mode is active.', err);
  });
}

module.exports = { start };
