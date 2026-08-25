import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';

import LandingPage from './pages/LandingPage';
import MenuPage from './pages/MenuPage';
import ItemDetailPage from './pages/ItemDetailPage';
import CartPage from './pages/CartPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import CashierLogin from './pages/CashierLogin';
import CashierDashboard from './pages/CashierDashboard';

// Wraps the three customer-facing routes so the cart is scoped to the
// table's token (from the URL) rather than being global app state.
function CustomerLayout({ children }) {
  const { token } = useParams();
  return <CartProvider tableToken={token}>{children}</CartProvider>;
}

function RequireStaffAuth({ children }) {
  const hasToken = Boolean(localStorage.getItem('staffToken'));
  return hasToken ? children : <Navigate to="/cashier/login" replace />;
}

export default function App() {
  return (
    <SocketProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/menu/t/:token"
            element={
              <CustomerLayout>
                <MenuPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/menu/t/:token/item/:itemId"
            element={
              <CustomerLayout>
                <ItemDetailPage />
              </CustomerLayout>
            }
          />
          <Route
            path="/menu/t/:token/cart"
            element={
              <CustomerLayout>
                <CartPage />
              </CustomerLayout>
            }
          />

          <Route path="/order/:orderId" element={<OrderConfirmationPage />} />

          <Route path="/cashier/login" element={<CashierLogin />} />
          <Route
            path="/cashier"
            element={
              <RequireStaffAuth>
                <CashierDashboard />
              </RequireStaffAuth>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </SocketProvider>
  );
}
