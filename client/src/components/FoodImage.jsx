const PALETTES = [
  ['#F0A202', '#C97F00'],
  ['#0F5257', '#0B3F43'],
  ['#C1272D', '#9E1F24'],
];

function hashName(name) {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) h = (h * 31 + name.charCodeAt(i)) % 997;
  return h;
}

export default function FoodImage({ name, image, className = '' }) {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        loading="lazy"
        className={`object-cover ${className}`}
      />
    );
  }

  const [from, to] = PALETTES[hashName(name || 'x') % PALETTES.length];
  const initial = (name || '?').trim().charAt(0).toUpperCase();

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ background: `linear-gradient(135deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      <span className="font-display text-paper/90 text-4xl select-none">{initial}</span>
    </div>
  );
}
