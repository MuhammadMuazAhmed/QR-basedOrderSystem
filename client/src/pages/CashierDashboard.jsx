import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listOrders, updateOrderStatus, listWaiterCalls, resolveWaiterCall } from '../api/client';
import { useRealtime } from '../context/RealtimeContext';
import OrderTicket from '../components/OrderTicket';
import Receipt from '../components/Receipt';
import { EmptyState, PageSpinner } from '../components/Feedback';

export default function CashierDashboard() {
  const navigate = useNavigate();
  const { pusher, connected } = useRealtime();

  const [orders, setOrders] = useState([]);
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printOrder, setPrintOrder] = useState(null);
  const staffInfo = JSON.parse(localStorage.getItem('staffInfo') || 'null');

  useEffect(() => {
    if (!localStorage.getItem('staffToken')) {
      navigate('/cashier/login');
    }
  }, [navigate]);

  const loadAll = useCallback(async () => {
    try {
      const [o, c] = await Promise.all([listOrders(), listWaiterCalls()]);
      setOrders(o);
      setCalls(c);
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem('staffToken');
        navigate('/cashier/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!pusher) return undefined;

    const channel = pusher.subscribe('staff-channel');

    const onNewOrder = (order) => setOrders((prev) => [order, ...prev]);
    const onStatusUpdated = (order) =>
      setOrders((prev) => prev.map((o) => (o._id === order._id ? order : o)));
    const onWaiterCall = (call) => setCalls((prev) => [call, ...prev]);
    const onWaiterResolved = (call) => setCalls((prev) => prev.filter((c) => c._id !== call._id));

    channel.bind('order:new', onNewOrder);
    channel.bind('order:status_updated', onStatusUpdated);
    channel.bind('waiter:call', onWaiterCall);
    channel.bind('waiter:resolved', onWaiterResolved);

    // Re-sync full state whenever the connection is (re)established, so a
    // dropped Wi-Fi connection doesn't leave the dashboard stale — Pusher
    // has no delivery guarantee for events missed while disconnected.
    pusher.connection.bind('connected', loadAll);

    return () => {
      channel.unbind('order:new', onNewOrder);
      channel.unbind('order:status_updated', onStatusUpdated);
      channel.unbind('waiter:call', onWaiterCall);
      channel.unbind('waiter:resolved', onWaiterResolved);
      pusher.connection.unbind('connected', loadAll);
      pusher.unsubscribe('staff-channel');
    };
  }, [pusher, loadAll]);

  const handleAdvance = async (id, status) => {
    setOrders((prev) => prev.map((o) => (o._id === id ? { ...o, status } : o)));
    try {
      await updateOrderStatus(id, status);
    } catch {
      loadAll();
    }
  };

  const handleCancel = async (id) => {
    if (!confirm('Cancel this order?')) return;
    await updateOrderStatus(id, 'cancelled');
    loadAll();
  };

  const handlePrint = (order) => {
    setPrintOrder(order);
    setTimeout(() => window.print(), 50);
  };

  const handleResolveCall = async (id) => {
    await resolveWaiterCall(id);
  };

  const logout = () => {
    localStorage.removeItem('staffToken');
    localStorage.removeItem('staffInfo');
    navigate('/cashier/login');
  };

  if (loading) return <PageSpinner label="Loading dashboard..." />;

  const activeOrders = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));

  return (
    <div className="min-h-screen bg-ink-950">
      <Receipt order={printOrder} />

      <header className="print:hidden flex items-center justify-between px-6 py-4 border-b border-ink-800">
        <div>
          <h1 className="font-display text-2xl text-paper">Cashier Dashboard</h1>
          <p className="text-xs text-paper/40 mt-0.5">
            {staffInfo?.name ? `Signed in as ${staffInfo.name}` : ''} ·{' '}
            <span className={connected ? 'text-teal-500' : 'text-chili-500'}>
              {connected ? '● live' : '○ reconnecting...'}
            </span>
          </p>
        </div>
        <button onClick={logout} className="text-paper/60 text-sm border border-ink-700 rounded-lg px-3 py-1.5">
          Sign out
        </button>
      </header>

      {calls.length > 0 && (
        <div className="print:hidden px-6 pt-4 flex flex-wrap gap-2">
          {calls.map((c) => (
            <div
              key={c._id}
              className="flex items-center gap-3 bg-chili-500/15 border border-chili-500/40 rounded-xl px-4 py-2"
            >
              <span className="text-chili-500 font-semibold text-sm">
                🔔 Table {c.tableNumber} needs assistance
              </span>
              <button
                onClick={() => handleResolveCall(c._id)}
                className="text-xs bg-chili-500 text-paper px-2.5 py-1 rounded-full"
              >
                Resolve
              </button>
            </div>
          ))}
        </div>
      )}

      <main className="print:hidden px-6 py-6">
        {activeOrders.length === 0 ? (
          <EmptyState icon="🧾" title="No active orders" subtitle="New orders will appear here instantly." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {activeOrders.map((order) => (
              <OrderTicket
                key={order._id}
                order={order}
                onAdvance={handleAdvance}
                onCancel={handleCancel}
                onPrint={handlePrint}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
