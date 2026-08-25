const { allowedOrigins } = require('../config/env');

let io = null;

// Event name constants shared by server + (documented for) client.
const EVENTS = {
  NEW_ORDER: 'order:new',
  ORDER_STATUS_UPDATED: 'order:status_updated',
  WAITER_CALL: 'waiter:call',
  WAITER_CALL_RESOLVED: 'waiter:resolved',
};

function noopSocketNamespace() {
  return {
    emit() {},
    join() {},
    leave() {},
    on() {},
    off() {},
  };
}

function initSockets() {
  io = {
    to() {
      return noopSocketNamespace();
    },
    on() {},
    emit() {},
  };
  return io;
}

function getIO() {
  if (!io) {
    initSockets();
  }
  return io;
}

module.exports = { initSockets, getIO, EVENTS, allowedOrigins };
