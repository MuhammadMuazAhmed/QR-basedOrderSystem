import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { staffLogin } from '../api/client';

export default function CashierLogin() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, staff } = await staffLogin(username, password);
      localStorage.setItem('staffToken', token);
      localStorage.setItem('staffInfo', JSON.stringify(staff));
      navigate('/cashier');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <p className="text-saffron-500 font-mono text-xs uppercase tracking-widest text-center">Staff Access</p>
        <h1 className="font-display text-3xl text-paper text-center mt-1 mb-8">Cashier Login</h1>

        <label className="block text-paper/60 text-xs mb-1.5">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-xl bg-ink-800 border border-ink-700 px-4 py-2.5 text-paper mb-4 focus:outline-none focus:border-saffron-500"
          autoFocus
        />

        <label className="block text-paper/60 text-xs mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl bg-ink-800 border border-ink-700 px-4 py-2.5 text-paper mb-2 focus:outline-none focus:border-saffron-500"
        />

        {error && <p className="text-chili-500 text-sm mt-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-saffron-500 disabled:opacity-60 text-ink-950 font-semibold rounded-xl py-3 mt-6"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>

        <p className="text-paper/30 text-xs text-center mt-6">
          Dev seed accounts — admin / admin123 · cashier / cashier123
        </p>
      </form>
    </div>
  );
}
