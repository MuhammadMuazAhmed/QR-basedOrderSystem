import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getMenuItem } from '../api/client';
import { useCart } from '../context/CartContext';
import FoodImage from '../components/FoodImage';
import { PageSpinner, EmptyState } from '../components/Feedback';

export default function ItemDetailPage() {
  const { token, itemId } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [item, setItem] = useState(null);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    getMenuItem(itemId)
      .then(setItem)
      .catch(() => setError('This item could not be found.'));
  }, [itemId]);

  if (error) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center">
        <EmptyState icon="🍽️" title={error} />
      </div>
    );
  }
  if (!item) return <PageSpinner label="Loading item..." />;

  const handleAdd = () => {
    addItem(item, qty);
    setAdded(true);
    setTimeout(() => navigate(`/menu/t/${token}`), 500);
  };

  return (
    <div className="min-h-screen bg-ink-950 pb-32">
      <div className="relative">
        <FoodImage name={item.name} image={item.image} className="h-64 w-full" />
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 h-9 w-9 rounded-full bg-ink-950/80 text-paper flex items-center justify-center"
        >
          ←
        </button>
        {!item.available && (
          <span className="absolute bottom-3 right-3 bg-chili-500 text-paper text-xs px-3 py-1 rounded-full">
            Currently unavailable
          </span>
        )}
      </div>

      <div className="px-5 pt-5">
        <h1 className="font-display text-2xl text-paper">{item.name}</h1>
        <p className="font-mono text-saffron-400 text-lg mt-1">Rs. {item.price}</p>
        {item.description && <p className="text-paper/70 mt-3 leading-relaxed">{item.description}</p>}

        {item.ingredients?.length > 0 && (
          <div className="mt-5">
            <p className="text-xs uppercase tracking-widest text-paper/40 mb-1.5">Ingredients</p>
            <p className="text-paper/80 text-sm">{item.ingredients.join(', ')}</p>
          </div>
        )}

        {item.allergens?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {item.allergens.map((a) => (
              <span key={a} className="text-xs bg-chili-500/15 text-chili-500 border border-chili-500/30 px-2.5 py-1 rounded-full">
                Contains {a}
              </span>
            ))}
          </div>
        )}
      </div>

      {item.available && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto flex items-center gap-3">
          <div className="flex items-center bg-ink-800 border border-ink-700 rounded-xl overflow-hidden">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-4 py-3 text-paper text-lg">
              −
            </button>
            <span className="px-3 font-mono text-paper w-6 text-center">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="px-4 py-3 text-paper text-lg">
              +
            </button>
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 bg-saffron-500 text-ink-950 font-semibold rounded-xl py-3.5 active:scale-[0.98] transition-transform"
          >
            {added ? 'Added ✓' : `Add to Cart · Rs. ${item.price * qty}`}
          </button>
        </div>
      )}
    </div>
  );
}
