import { createContext, useContext, useEffect, useState } from 'react';
import Pusher from 'pusher-js';

const RealtimeContext = createContext(null);

const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || 'ap2';

export function RealtimeProvider({ children }) {
  const [pusher, setPusher] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!PUSHER_KEY) {
      console.warn(
        '[realtime] VITE_PUSHER_KEY is not set — live order/waiter updates will not work. See client/.env.example.'
      );
      return undefined;
    }

    const client = new Pusher(PUSHER_KEY, { cluster: PUSHER_CLUSTER });
    client.connection.bind('connected', () => setConnected(true));
    client.connection.bind('disconnected', () => setConnected(false));
    client.connection.bind('unavailable', () => setConnected(false));
    setPusher(client);

    return () => client.disconnect();
  }, []);

  return (
    <RealtimeContext.Provider value={{ pusher, connected }}>{children}</RealtimeContext.Provider>
  );
}

export function useRealtime() {
  const ctx = useContext(RealtimeContext);
  if (!ctx) throw new Error('useRealtime must be used within RealtimeProvider');
  return ctx;
}

// Small helper: subscribe to a channel and bind one event, with automatic
// cleanup. Returns nothing — call from a useEffect.
export function bindChannelEvent(pusher, channelName, eventName, handler) {
  if (!pusher) return () => {};
  const channel = pusher.channel(channelName) || pusher.subscribe(channelName);
  channel.bind(eventName, handler);
  return () => {
    channel.unbind(eventName, handler);
    // Only fully unsubscribe if nothing else is listening — keep it simple
    // and leave the channel subscribed for the component tree's lifetime.
  };
}
