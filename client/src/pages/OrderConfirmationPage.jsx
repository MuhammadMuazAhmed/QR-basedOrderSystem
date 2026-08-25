import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getOrder } from '../api/client';
import { useSocket } from '../context/SocketContext';
import { PageSpinner, EmptyState } from '../components/Feedback';

const STATUS_STEPS = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
const STATUS_LABEL = {
  pending: 'Order received',
  confirmed: 'Confirmed by cashier',
  preparing: 'Being prepared',
  ready: 'Ready to serve',
  completed: 'Delivered — enjoy!',
  cancelled: 'Order cancelled',
};

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const { socket } = useSocket();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrder(orderId)
      .then(setOrder)
      .catch(() => setError('This order could not be found.'));
  }, [orderId]);

  useEffect(() => {
    if (!socket || !order) return;
    socket.emit('table:join', order.tableNumber);

    const handler = (updated) => {
      if (updated._id === orderId) setOrder(updated);
    };
    socket.on('order:status_updated', handler);
    return () => socket.off('order:status_updated', handler);
  }, [socket, order, orderId]);

  if (error) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <EmptyState icon="❓" title={error} />
      </div>
    );
  }
  if (!order) return <PageSpinner label="Loading your order..." />;

  const activeIndex = STATUS_STEPS.indexOf(order.status);
  const cancelled = order.status === 'cancelled';

  return (
    <div className="min-h-screen bg-ink-950 px-5 pt-10 pb-16">
      <div className="text-center mb-8">
        <p className="text-saffron-500 font-mono text-xs uppercase tracking-widest">Order Placed</p>
        <h1 className="font-display text-4xl text-paper mt-1">#{order.orderNumber}</h1>
        <p className="text-paper/50 text-sm mt-1">Table {order.tableNumber}</p>
      </div>

      {!cancelled ? (
        <div className="flex justify-between mb-10 px-2">
          {STATUS_STEPS.map((step, i) => (
            <div key={step} className="flex flex-col items-center flex-1">
              <div
                className={`h-3 w-3 rounded-full ${
                  i <= activeIndex ? 'bg-saffron-500' : 'bg-ink-700'
                }`}
              />
              {i < STATUS_STEPS.length - 1 && (
                <div className={`h-0.5 w-full mt-1.5 ${i < activeIndex ? 'bg-saffron-500' : 'bg-ink-700'}`} />
              )}
            </div>
          ))}
        </div>
      ) : null}

      <p className={`text-center font-display text-xl mb-8 ${cancelled ? 'text-chili-500' : 'text-paper'}`}>
        {STATUS_LABEL[order.status]}
      </p>

      <div className="bg-ink-800 border border-ink-700 rounded-2xl ticket-edge text-ink-800 p-5">
        {order.items.map((it) => (
          <div key={it.menuItem} className="flex justify-between text-sm py-1.5 border-b border-ink-700/60 last:border-none">
            <span className="text-paper/80">
              {it.quantity} × {it.name}
            </span>
            <span className="font-mono text-paper/80">Rs. {it.lineTotal}</span>
          </div>
        ))}
        <div className="flex justify-between pt-3 mt-1 font-semibold">
          <span className="text-paper">Total</span>
          <span className="font-mono text-saffron-400">Rs. {order.total}</span>
        </div>
      </div>
    </div>
  );
}
