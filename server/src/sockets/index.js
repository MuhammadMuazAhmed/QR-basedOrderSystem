const { Server } = require('socket.io');
const { allowedOrigins } = require('../config/env');

let io = null;

// Event name constants shared by server + (documented for) client.
const EVENTS = {
  NEW_ORDER: 'order:new',
  ORDER_STATUS_UPDATED: 'order:status_updated',
  WAITER_CALL: 'waiter:call',
  WAITER_CALL_RESOLVED: 'waiter:resolved',
};

function initSockets(httpServer) {
  io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
          return;
        }
        callback(new Error('Not allowed by Socket.IO CORS'));
      },
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    // Staff dashboards join the shared "staff" room to receive all events.
    socket.on('staff:join', () => {
      socket.join('staff');
    });

    // Customers join a per-table room so status updates for THEIR order
    // can be pushed without broadcasting to everyone.
    socket.on('table:join', (tableNumber) => {
      if (tableNumber) socket.join(`table:${tableNumber}`);
    });

    socket.on('disconnect', () => {
      // no-op — socket.io cleans up room membership automatically
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error('Socket.io not initialized yet. Call initSockets(server) first.');
  return io;
}

module.exports = { initSockets, getIO, EVENTS };
