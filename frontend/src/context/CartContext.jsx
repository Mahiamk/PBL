import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const sanitizeCartItems = (items) => {
  if (!Array.isArray(items)) return [];
  return items.map(item => ({
    ...item,
    cartId: item.cartId || `${item.product_id}-${item.selectedOption || 'default'}`,
    quantity: Math.max(1, Number(item.quantity) || 1),
    product_price: Number(item.product_price) || 0
  }));
};

const loadUserCartFromStorage = (userId) => {
  if (!userId) return [];
  try {
    const saved = localStorage.getItem(`cart_user_${userId}`);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        return sanitizeCartItems(parsed);
      }
    }
  } catch (e) {
    console.error("Failed to load user cart from localStorage", e);
  }
  return [];
};

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const currentUserId = user?.userId || null;
  const prevUserIdRef = useRef(currentUserId);

  // For registered users, load their specific cart from localStorage.
  // For guests (unregistered users), it is kept purely as state.
  const [cart, setCart] = useState(() => {
    return currentUserId ? loadUserCartFromStorage(currentUserId) : [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // When user switches or logs in/out, switch to that user's unique cart or fresh guest state
  useEffect(() => {
    if (prevUserIdRef.current !== currentUserId) {
      prevUserIdRef.current = currentUserId;
      if (currentUserId) {
        setCart(loadUserCartFromStorage(currentUserId));
      } else {
        // User logged out: guest cart is fresh in state
        setCart([]);
      }
    }
  }, [currentUserId]);

  // Persist ONLY for registered users with their unique user account key
  useEffect(() => {
    if (currentUserId) {
      try {
        localStorage.setItem(`cart_user_${currentUserId}`, JSON.stringify(cart));
      } catch (e) {
        console.error("Failed to save user cart to localStorage", e);
      }
    }
  }, [cart, currentUserId]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const cartId = product.cartId || `${product.product_id}-${product.selectedOption || 'default'}`;
      const existing = prev.find((item) => item.cartId === cartId);
      let updated;
      if (existing) {
        updated = prev.map((item) =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        updated = [...prev, { ...product, quantity, cartId }];
      }
      if (currentUserId) {
        try {
          localStorage.setItem(`cart_user_${currentUserId}`, JSON.stringify(updated));
        } catch (e) {
          console.error("Error writing user cart in addToCart", e);
        }
      }
      return updated;
    });
    openCart();
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => {
      const updated = prev.filter((item) => item.cartId !== cartId);
      if (currentUserId) {
        try {
          localStorage.setItem(`cart_user_${currentUserId}`, JSON.stringify(updated));
        } catch (e) {
          console.error("Error writing user cart in removeFromCart", e);
        }
      }
      return updated;
    });
  };

  const updateQuantity = (cartId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(cartId);
      return;
    }
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.cartId === cartId ? { ...item, quantity } : item
      );
      if (currentUserId) {
        try {
          localStorage.setItem(`cart_user_${currentUserId}`, JSON.stringify(updated));
        } catch (e) {
          console.error("Error writing user cart in updateQuantity", e);
        }
      }
      return updated;
    });
  };

  const clearCart = () => {
    setCart([]);
    if (currentUserId) {
      try {
        localStorage.setItem(`cart_user_${currentUserId}`, JSON.stringify([]));
      } catch (e) {
        console.error("Error clearing user cart storage", e);
      }
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  const cartDistinctCount = cart.length;
  const cartTotal = cart.reduce((acc, item) => acc + (Number(item.product_price) || 0) * (Number(item.quantity) || 1), 0);

  return (
    <CartContext.Provider value={{ 
      cart, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart, 
      cartCount, 
      cartDistinctCount,
      cartTotal,
      isCartOpen,
      openCart,
      closeCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

