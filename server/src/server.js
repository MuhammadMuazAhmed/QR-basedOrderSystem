const http = require('http');
const app = require('./app');
const connectDB = require('./config/db');
const { initSockets } = require('./sockets');
const { port } = require('./config/env');

async function start() {
  await connectDB();

  const server = http.createServer(app);
  initSockets(server);

  server.listen(port, () => {
    console.log(`[server] QR Cafeteria API listening on http://localhost:${port}`);
    console.log(`[server] Socket.io real-time layer ready`);
  });
}

start();
