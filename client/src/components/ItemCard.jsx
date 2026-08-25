import FoodImage from './FoodImage';

export default function ItemCard({ item, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!item.available}
      className={`text-left rounded-2xl overflow-hidden bg-ink-800 border border-ink-700 transition-transform ${
        item.available ? 'active:scale-[0.98] hover:border-saffron-500/50' : 'opacity-50'
      }`}
    >
      <div className="relative h-32 w-full">
        <FoodImage name={item.name} image={item.image} className="h-32 w-full" />
        {!item.available && (
          <span className="absolute top-2 right-2 bg-ink-950/90 text-paper/80 text-[11px] px-2 py-0.5 rounded-full">
            Unavailable
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="font-body font-semibold text-paper text-sm leading-snug line-clamp-2">
          {item.name}
        </p>
        <p className="font-mono text-saffron-400 text-sm mt-1">Rs. {item.price}</p>
      </div>
    </button>
  );
}
