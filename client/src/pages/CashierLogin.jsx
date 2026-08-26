import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { setupStaffAccount, staffLogin } from '../api/client';

export default function CashierLogin() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [setupSecret, setSetupSecret] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === 'setup') {
        await setupStaffAccount({ name, username, password, setupSecret });
        setMode('login');
        setSetupSecret('');
        setMessage('Account created. Sign in to continue.');
      } else {
        const { token, staff } = await staffLogin(username, password);
        localStorage.setItem('staffToken', token);
        localStorage.setItem('staffInfo', JSON.stringify(staff));
        navigate('/cashier');
      }
    } catch (err) {
      setError(err.response?.data?.message || (mode === 'setup' ? 'Account creation failed' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  const isSetup = mode === 'setup';

  return (
    <div className="min-h-screen bg-ink-950 flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <p className="text-saffron-500 font-mono text-xs uppercase tracking-widest text-center">Staff Access</p>
        <h1 className="font-display text-3xl text-paper text-center mt-1 mb-8">{isSetup ? 'Create Account' : 'Cashier Login'}</h1>

        {isSetup && (
          <>
            <label className="block text-paper/60 text-xs mb-1.5">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl bg-ink-800 border border-ink-700 px-4 py-2.5 text-paper mb-4 focus:outline-none focus:border-saffron-500"
              autoFocus
              required
            />
          </>
        )}

        <label className="block text-paper/60 text-xs mb-1.5">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full rounded-xl bg-ink-800 border border-ink-700 px-4 py-2.5 text-paper mb-4 focus:outline-none focus:border-saffron-500"
          autoFocus={!isSetup}
          required
        />

        <label className="block text-paper/60 text-xs mb-1.5">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full rounded-xl bg-ink-800 border border-ink-700 px-4 py-2.5 text-paper mb-2 focus:outline-none focus:border-saffron-500"
          required
        />

        {isSetup && (
          <>
            <label className="block text-paper/60 text-xs mt-4 mb-1.5">Setup Secret</label>
            <input
              type="password"
              value={setupSecret}
              onChange={(e) => setSetupSecret(e.target.value)}
              className="w-full rounded-xl bg-ink-800 border border-ink-700 px-4 py-2.5 text-paper mb-2 focus:outline-none focus:border-saffron-500"
              required
            />
            <p className="text-paper/40 text-xs mt-2">This creates the first admin account. The secret is stored only on the server.</p>
          </>
        )}

        {error && <p className="text-chili-500 text-sm mt-2">{error}</p>}
        {message && <p className="text-saffron-500 text-sm mt-2">{message}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-saffron-500 disabled:opacity-60 text-ink-950 font-semibold rounded-xl py-3 mt-6"
        >
          {loading ? (isSetup ? 'Creating account...' : 'Signing in...') : (isSetup ? 'Create Account' : 'Sign In')}
        </button>

        <button
          type="button"
          onClick={() => {
            setMode(isSetup ? 'login' : 'setup');
            setError(null);
            setMessage(null);
          }}
          className="w-full text-saffron-500 text-sm mt-5"
        >
          {isSetup ? 'Back to Sign In' : 'Create an account'}
        </button>
      </form>
    </div>
  );
}
