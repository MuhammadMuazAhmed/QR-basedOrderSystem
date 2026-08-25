export default function CategoryNav({ categories, activeSlug, onSelect }) {
  return (
    <div className="sticky top-0 z-20 bg-ink-950/95 backdrop-blur border-b border-ink-800">
      <div className="flex gap-2 overflow-x-auto px-4 py-3 scrollbar-none">
        {categories.map((cat) => {
          const active = cat.slug === activeSlug;
          return (
            <button
              key={cat.slug}
              onClick={() => onSelect(cat.slug)}
              className={`shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                active
                  ? 'bg-saffron-500 text-ink-950 border-saffron-500'
                  : 'bg-transparent text-paper/70 border-ink-700 hover:border-saffron-500/60'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
