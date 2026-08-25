import { Link } from 'react-router-dom';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-ink-950 flex flex-col items-center justify-center px-6 text-center">
      <p className="text-saffron-500 font-mono text-xs uppercase tracking-widest">QR Ordering System</p>
      <h1 className="font-display text-4xl text-paper mt-2 mb-3">Scan a table QR to order</h1>
      <p className="text-paper/50 max-w-sm mb-8">
        This screen isn't part of the customer flow — customers land directly on their table's
        menu after scanning. Run <code className="text-saffron-400">npm run generate:qrs</code> in
        the server to print testable table QR codes.
      </p>
      <Link
        to="/cashier/login"
        className="bg-ink-800 border border-ink-700 text-paper px-5 py-2.5 rounded-xl text-sm"
      >
        Staff / Cashier Login →
      </Link>
    </div>
  );
}
