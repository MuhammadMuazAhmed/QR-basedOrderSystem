import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { resolveTable, getMenu } from '../api/client';
import CategoryNav from '../components/CategoryNav';
import ItemCard from '../components/ItemCard';
import CartBar from '../components/CartBar';
import CallWaiterButton from '../components/CallWaiterButton';
import { PageSpinner, ItemCardSkeleton, EmptyState } from '../components/Feedback';

export default function MenuPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [table, setTable] = useState(null);
  const [menu, setMenu] = useState(null);
  const [activeSlug, setActiveSlug] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [t, m] = await Promise.all([resolveTable(token), getMenu()]);
        if (cancelled) return;
        setTable(t);
        setMenu(m);
        if (m.length) setActiveSlug(m[0].slug);
      } catch (err) {
        if (!cancelled) setError(err.response?.data?.message || 'Something went wrong loading the menu.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const filteredMenu = useMemo(() => {
    if (!menu) return [];
    if (!search.trim()) return menu;
    const q = search.trim().toLowerCase();
    return menu
      .map((cat) => ({ ...cat, items: cat.items.filter((i) => i.name.toLowerCase().includes(q)) }))
      .filter((cat) => cat.items.length > 0);
  }, [menu, search]);

  if (loading) return <PageSpinner label="Loading menu..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-ink-950 flex items-center justify-center px-6">
        <EmptyState icon="⚠️" title="Couldn't load your table" subtitle={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-950 pb-28">
      <header className="px-4 pt-6 pb-3">
        <p className="text-saffron-500 font-mono text-xs tracking-widest uppercase">
          Table {table.tableNumber}
        </p>
        <h1 className="font-display text-3xl text-paper mt-1">Today's Menu</h1>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dishes..."
          className="mt-4 w-full rounded-xl bg-ink-800 border border-ink-700 px-4 py-2.5 text-paper placeholder:text-paper/40 focus:outline-none focus:border-saffron-500"
        />
      </header>

      <CallWaiterButton />

      {!search.trim() && (
        <CategoryNav
          categories={menu}
          activeSlug={activeSlug}
          onSelect={(slug) => {
            setActiveSlug(slug);
            document.getElementById(`cat-${slug}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
        />
      )}

      {filteredMenu.length === 0 && (
        <EmptyState title="No dishes found" subtitle="Try a different search term." icon="🔍" />
      )}

      <div className="px-4 mt-4 space-y-8">
        {filteredMenu.map((cat) => (
          <section key={cat.slug} id={`cat-${cat.slug}`}>
            <h2 className="font-display text-xl text-paper mb-3">{cat.name}</h2>
            {cat.items.length === 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {[0, 1].map((i) => (
                  <ItemCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {cat.items.map((item) => (
                  <ItemCard
                    key={item._id}
                    item={item}
                    onClick={() => navigate(`/menu/t/${token}/item/${item._id}`)}
                  />
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <CartBar />
    </div>
  );
}
