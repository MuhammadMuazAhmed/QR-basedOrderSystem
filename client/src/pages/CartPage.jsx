import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { placeOrder } from '../api/client';
import FoodImage from '../components/FoodImage';
import { EmptyState } from '../components/Feedback';

export default function CartPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { lines, setQuantity, removeItem, clearCart, subtotal } = useCart();
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  const handlePlaceOrder = async () => {
    if (placing || lines.length === 0) return;
    setPlacing(true);
    setError(null);
    try {
      const order = await placeOrder({
        tableToken: token,
        items: lines.map((l) => ({ menuItemId: l.menuItemId, quantity: l.quantity })),
        notes,
      });
      clearCart();
      navigate(`/order/${order._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not place order. Please try again.');
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 pb-40">
      <header className="px-4 pt-6 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-paper h-9 w-9 rounded-full bg-ink-800 flex items-center justify-center">
          ←
        </button>
        <h1 className="font-display text-2xl text-paper">Your Cart</h1>
      </header>

      {lines.length === 0 ? (
        <EmptyState icon="🛒" title="Your cart is empty" subtitle="Add something delicious from the menu." />
      ) : (
        <div className="px-4 space-y-3">
          {lines.map((l) => (
            <div key={l.menuItemId} className="flex gap-3 bg-ink-800 border border-ink-700 rounded-2xl p-3">
              <FoodImage name={l.name} image={l.image} className="h-16 w-16 rounded-xl shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-paper font-medium text-sm truncate">{l.name}</p>
                <p className="font-mono text-saffron-400 text-sm mt-0.5">Rs. {l.price}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => setQuantity(l.menuItemId, l.quantity - 1)}
                    className="h-7 w-7 rounded-full bg-ink-700 text-paper text-sm"
                  >
                    −
                  </button>
                  <span className="font-mono text-paper text-sm w-4 text-center">{l.quantity}</span>
                  <button
                    onClick={() => setQuantity(l.menuItemId, l.quantity + 1)}
                    className="h-7 w-7 rounded-full bg-ink-700 text-paper text-sm"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(l.menuItemId)}
                    className="ml-auto text-xs text-chili-500"
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any notes for the kitchen? (optional)"
            rows={2}
            className="w-full rounded-xl bg-ink-800 border border-ink-700 px-4 py-2.5 text-paper placeholder:text-paper/40 focus:outline-none focus:border-saffron-500 resize-none"
          />
        </div>
      )}

      {lines.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-ink-900 border-t border-ink-700 ticket-edge text-ink-900 px-5 pt-4 pb-6">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-paper/70 text-sm mb-1">
              <span>Subtotal</span>
              <span className="font-mono">Rs. {subtotal}</span>
            </div>
            <div className="flex justify-between text-paper font-semibold text-lg mb-3">
              <span>Total</span>
              <span className="font-mono text-saffron-400">Rs. {subtotal}</span>
            </div>
            {error && <p className="text-chili-500 text-sm mb-2">{error}</p>}
            <button
              onClick={handlePlaceOrder}
              disabled={placing}
              className="w-full bg-saffron-500 disabled:opacity-60 text-ink-950 font-semibold rounded-xl py-3.5 active:scale-[0.98] transition-transform"
            >
              {placing ? 'Placing order...' : 'Place Order'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
