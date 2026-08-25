const NEXT_STATUS = {
  pending: 'confirmed',
  confirmed: 'preparing',
  preparing: 'ready',
  ready: 'completed',
};
const NEXT_LABEL = {
  pending: 'Confirm Order',
  confirmed: 'Start Preparing',
  preparing: 'Mark Ready',
  ready: 'Mark Delivered',
};
const STATUS_COLOR = {
  pending: 'border-saffron-500',
  confirmed: 'border-teal-500',
  preparing: 'border-teal-500',
  ready: 'border-chili-500',
  completed: 'border-ink-700',
  cancelled: 'border-ink-700',
};

export default function OrderTicket({ order, onAdvance, onCancel, onPrint }) {
  const nextStatus = NEXT_STATUS[order.status];
  const isNew = order.status === 'pending';

  return (
    <div
      className={`bg-ink-800 border-2 ${STATUS_COLOR[order.status]} rounded-2xl p-4 ${
        isNew ? 'animate-ticket-in ring-2 ring-saffron-500/40' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <p className="font-mono text-xs text-paper/50">ORDER #{order.orderNumber}</p>
          <p className="font-display text-2xl text-paper leading-none mt-0.5">
            Table {order.tableNumber}
          </p>
        </div>
        <span className="uppercase text-[11px] tracking-wider bg-ink-700 text-paper/70 px-2 py-1 rounded-full">
          {order.status}
        </span>
      </div>

      <div className="border-t border-ink-700 my-2" />

      {order.items.map((it) => (
        <div key={it.menuItem} className="flex justify-between text-sm py-0.5">
          <span className="text-paper/80">
            {it.quantity} × {it.name}
          </span>
          <span className="font-mono text-paper/60">Rs. {it.lineTotal}</span>
        </div>
      ))}

      {order.notes && (
        <p className="text-xs text-saffron-400 mt-2 italic">Note: {order.notes}</p>
      )}

      <div className="flex justify-between font-semibold mt-2 pt-2 border-t border-ink-700">
        <span className="text-paper">Total</span>
        <span className="font-mono text-saffron-400">Rs. {order.total}</span>
      </div>

      <div className="flex gap-2 mt-3">
        {nextStatus && (
          <button
            onClick={() => onAdvance(order._id, nextStatus)}
            className="flex-1 bg-saffron-500 text-ink-950 text-sm font-semibold rounded-lg py-2"
          >
            {NEXT_LABEL[order.status]}
          </button>
        )}
        <button
          onClick={() => onPrint(order)}
          className="px-3 bg-ink-700 text-paper text-sm rounded-lg"
          title="Print receipt"
        >
          🖨️
        </button>
        {order.status !== 'completed' && order.status !== 'cancelled' && (
          <button
            onClick={() => onCancel(order._id)}
            className="px-3 bg-chili-500/20 text-chili-500 text-sm rounded-lg"
            title="Cancel order"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
