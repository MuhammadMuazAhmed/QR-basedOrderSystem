import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const CartContext = createContext(null);

function storageKey(tableToken) {
  return `cart:${tableToken}`;
}

export function CartProvider({ tableToken, children }) {
  const [lines, setLines] = useState([]);

  useEffect(() => {
    if (!tableToken) return;
    try {
      const raw = localStorage.getItem(storageKey(tableToken));
      setLines(raw ? JSON.parse(raw) : []);
    } catch {
      setLines([]);
    }
  }, [tableToken]);

  useEffect(() => {
    if (!tableToken) return;
    localStorage.setItem(storageKey(tableToken), JSON.stringify(lines));
  }, [lines, tableToken]);

  const addItem = useCallback((item, quantity = 1) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.menuItemId === item._id);
      if (existing) {
        return prev.map((l) =>
          l.menuItemId === item._id ? { ...l, quantity: l.quantity + quantity } : l
        );
      }
      return [
        ...prev,
        {
          menuItemId: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          quantity,
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((menuItemId, quantity) => {
    setLines((prev) => {
      if (quantity <= 0) return prev.filter((l) => l.menuItemId !== menuItemId);
      return prev.map((l) => (l.menuItemId === menuItemId ? { ...l, quantity } : l));
    });
  }, []);

  const removeItem = useCallback((menuItemId) => {
    setLines((prev) => prev.filter((l) => l.menuItemId !== menuItemId));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [lines]
  );
  const itemCount = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  const value = { lines, addItem, setQuantity, removeItem, clearCart, subtotal, itemCount };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
