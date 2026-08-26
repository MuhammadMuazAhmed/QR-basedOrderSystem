export default function Home() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '3rem', color: '#eee', background: '#111', minHeight: '100vh' }}>
      <h1>QR Cafeteria — API server</h1>
      <p>This project only serves the backend API under <code>/api/*</code>.</p>
      <p>The customer &amp; cashier UI is a separate app — see the client's Vercel deployment.</p>
      <p>Health check: <a href="/api/health" style={{ color: '#f0a202' }}>/api/health</a></p>
    </main>
  );
}
