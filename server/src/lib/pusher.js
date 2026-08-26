import Pusher from 'pusher';

// Real-time replacement for the old Socket.io layer. Vercel serverless
// functions are stateless and short-lived — they cannot hold open
// WebSocket connections — so real-time delivery has to go through a
// managed pub/sub service instead. Pusher's free tier (200k msgs/day,
// 100 concurrent connections) comfortably covers a single cafeteria.
export const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

// Channel/event names shared conceptually with the client (see
// client/src/context/RealtimeContext.jsx).
export const CHANNELS = {
  staff: 'staff-channel',
  table: (tableNumber) => `table-${tableNumber}`,
};

export const EVENTS = {
  NEW_ORDER: 'order:new',
  ORDER_STATUS_UPDATED: 'order:status_updated',
  WAITER_CALL: 'waiter:call',
  WAITER_CALL_RESOLVED: 'waiter:resolved',
};
