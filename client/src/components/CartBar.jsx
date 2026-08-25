import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartBar() {
  const { itemCount, subtotal } = useCart();
  const { token } = useParams();
  const navigate = useNavigate();

  if (itemCount === 0) return null;

  return (
    <button
      onClick={() => navigate(`/menu/t/${token}/cart`)}
      className="fixed bottom-4 left-4 right-4 z-30 mx-auto max-w-md rounded-2xl bg-saffron-500 text-ink-950 shadow-lg shadow-black/40 px-5 py-3.5 flex items-center justify-between font-body font-semibold active:scale-[0.98] transition-transform animate-ticket-in"
    >
      <span className="flex items-center gap-2">
        <span className="bg-ink-950 text-saffron-400 rounded-full h-6 w-6 flex items-center justify-center text-xs font-bold">
          {itemCount}
        </span>
        View Cart
      </span>
      <span className="font-mono">Rs. {subtotal}</span>
    </button>
  );
}
