export default function Receipt({ order, cafeteriaName = 'Cafeteria' }) {
  if (!order) return null;
  return (
    <div id="receipt-print" className="hidden print:block font-mono text-black p-4 w-[300px]">
      <p className="text-center font-bold text-lg">{cafeteriaName}</p>
      <p className="text-center text-xs">Order Receipt</p>
      <div className="border-t border-dashed border-black my-2" />
      <p className="text-xs">Order #{order.orderNumber}</p>
      <p className="text-xs">Table: {order.tableNumber}</p>
      <p className="text-xs">{new Date(order.createdAt).toLocaleString()}</p>
      <div className="border-t border-dashed border-black my-2" />
      {order.items.map((it) => (
        <div key={it.menuItem} className="flex justify-between text-xs py-0.5">
          <span>
            {it.quantity} x {it.name}
          </span>
          <span>Rs. {it.lineTotal}</span>
        </div>
      ))}
      <div className="border-t border-dashed border-black my-2" />
      <div className="flex justify-between text-xs">
        <span>Subtotal</span>
        <span>Rs. {order.subtotal}</span>
      </div>
      <div className="flex justify-between font-bold text-sm mt-1">
        <span>TOTAL</span>
        <span>Rs. {order.total}</span>
      </div>
      <p className="text-center text-xs mt-4">Thank you!</p>
    </div>
  );
}
