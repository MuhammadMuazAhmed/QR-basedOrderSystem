import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { callWaiter } from '../api/client';

export default function CallWaiterButton() {
  const { token } = useParams();
  const [state, setState] = useState('idle'); // idle | sending | sent

  const handleClick = async () => {
    if (state !== 'idle') return;
    setState('sending');
    try {
      await callWaiter(token);
      setState('sent');
      setTimeout(() => setState('idle'), 6000);
    } catch {
      setState('idle');
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`fixed top-4 right-4 z-30 rounded-full h-11 w-11 flex items-center justify-center shadow-lg shadow-black/40 transition-colors ${
        state === 'sent' ? 'bg-teal-500 text-paper' : 'bg-ink-800 border border-ink-700 text-paper'
      }`}
      title="Call Waiter"
    >
      {state === 'sending' ? (
        <span className="h-4 w-4 rounded-full border-2 border-paper border-t-transparent animate-spin" />
      ) : state === 'sent' ? (
        '✓'
      ) : (
        '🔔'
      )}
    </button>
  );
}
