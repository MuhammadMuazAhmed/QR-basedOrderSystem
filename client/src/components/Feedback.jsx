export function PageSpinner({ label = 'Loading...' }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-ink-950 text-paper">
      <div className="h-8 w-8 rounded-full border-2 border-saffron-500 border-t-transparent animate-spin" />
      <p className="text-sm text-paper/60 font-body">{label}</p>
    </div>
  );
}

export function ItemCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden bg-ink-800 animate-pulse">
      <div className="h-32 bg-ink-700" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-3/4 bg-ink-700 rounded" />
        <div className="h-3 w-1/3 bg-ink-700 rounded" />
      </div>
    </div>
  );
}

export function EmptyState({ title, subtitle, icon = '🍽️' }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="font-display text-lg text-paper">{title}</p>
      {subtitle && <p className="text-sm text-paper/50 mt-1 max-w-xs">{subtitle}</p>}
    </div>
  );
}
