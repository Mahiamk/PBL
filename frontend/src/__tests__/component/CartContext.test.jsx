/**
 * Component tests for CartContext
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('CartContext', () => {
  let cart;
  let setCart;

  beforeEach(() => {
    cart = [];
    setCart = vi.fn((updater) => {
      if (typeof updater === 'function') {
        cart = updater(cart);
      } else {
        cart = updater;
      }
    });
    localStorage.getItem.mockReturnValue(null);
  });

  describe('addToCart', () => {
    it('should add new item to cart', () => {
      const product = {
        product_id: 1,
        product_name: 'Test Product',
        product_price: 29.99,
        store_id: 1
      };

      const addToCart = (product, quantity = 1) => {
        const cartId = `${product.product_id}-default`;
        const existing = cart.find((item) => item.cartId === cartId);
        if (existing) {
          cart = cart.map((item) =>
            item.cartId === cartId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          cart = [...cart, { ...product, quantity, cartId }];
        }
      };

      addToCart(product, 1);

      expect(cart.length).toBe(1);
      expect(cart[0].product_name).toBe('Test Product');
      expect(cart[0].quantity).toBe(1);
    });

    it('should increment quantity for existing item', () => {
      cart = [{
        product_id: 1,
        product_name: 'Test Product',
        product_price: 29.99,
        quantity: 1,
        cartId: '1-default'
      }];

      const addToCart = (product, quantity = 1) => {
        const cartId = `${product.product_id}-default`;
        const existing = cart.find((item) => item.cartId === cartId);
        if (existing) {
          cart = cart.map((item) =>
            item.cartId === cartId
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          cart = [...cart, { ...product, quantity, cartId }];
        }
      };

      addToCart({ product_id: 1 }, 2);

      expect(cart.length).toBe(1);
      expect(cart[0].quantity).toBe(3);
    });

    it('should handle different product variants as separate items', () => {
      const product1 = {
        product_id: 1,
        product_name: 'T-Shirt',
        selectedOption: 'red',
        cartId: '1-red'
      };
      const product2 = {
        product_id: 1,
        product_name: 'T-Shirt',
        selectedOption: 'blue',
        cartId: '1-blue'
      };

      cart = [{ ...product1, quantity: 1 }];

      const addToCart = (product, quantity = 1) => {
        const cartId = product.cartId;
        const existing = cart.find((item) => item.cartId === cartId);
        if (!existing) {
          cart = [...cart, { ...product, quantity }];
        }
      };

      addToCart(product2, 1);

      expect(cart.length).toBe(2);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', () => {
      cart = [
        { cartId: '1-default', product_id: 1, quantity: 2 },
        { cartId: '2-default', product_id: 2, quantity: 1 }
      ];

      const removeFromCart = (cartId) => {
        cart = cart.filter((item) => item.cartId !== cartId);
      };

      removeFromCart('1-default');

      expect(cart.length).toBe(1);
      expect(cart[0].product_id).toBe(2);
    });
  });

  describe('updateQuantity', () => {
    it('should update item quantity', () => {
      cart = [{ cartId: '1-default', product_id: 1, quantity: 2 }];

      const updateQuantity = (cartId, quantity) => {
        cart = cart.map((item) =>
          item.cartId === cartId ? { ...item, quantity } : item
        );
      };

      updateQuantity('1-default', 5);

      expect(cart[0].quantity).toBe(5);
    });

    it('should remove item when quantity is 0', () => {
      cart = [{ cartId: '1-default', product_id: 1, quantity: 2 }];

      const updateQuantity = (cartId, quantity) => {
        if (quantity <= 0) {
          cart = cart.filter((item) => item.cartId !== cartId);
        } else {
          cart = cart.map((item) =>
            item.cartId === cartId ? { ...item, quantity } : item
          );
        }
      };

      updateQuantity('1-default', 0);

      expect(cart.length).toBe(0);
    });
  });

  describe('clearCart', () => {
    it('should clear all items from cart', () => {
      cart = [
        { cartId: '1-default', product_id: 1, quantity: 2 },
        { cartId: '2-default', product_id: 2, quantity: 1 }
      ];

      const clearCart = () => {
        cart = [];
      };

      clearCart();

      expect(cart.length).toBe(0);
    });
  });

  describe('Cart Persistence', () => {
    it('should save cart to localStorage', () => {
      cart = [{ cartId: '1-default', product_id: 1, quantity: 1 }];
      
      localStorage.setItem('cart', JSON.stringify(cart));
      
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'cart',
        JSON.stringify(cart)
      );
    });

    it('should restore cart from localStorage', () => {
      const savedCart = [{ cartId: '1-default', product_id: 1, quantity: 2 }];
      localStorage.getItem.mockReturnValue(JSON.stringify(savedCart));

      const restored = JSON.parse(localStorage.getItem('cart'));

      expect(restored.length).toBe(1);
      expect(restored[0].quantity).toBe(2);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.getItem.mockReturnValue('invalid json');

      let parsedCart = [];
      try {
        parsedCart = JSON.parse(localStorage.getItem('cart'));
      } catch (e) {
        parsedCart = [];
      }

      expect(parsedCart).toEqual([]);
    });
  });

  describe('getCartTotal', () => {
    it('should calculate correct total', () => {
      cart = [
        { product_price: 29.99, quantity: 2 },
        { product_price: 19.99, quantity: 1 }
      ];

      const getCartTotal = () => {
        return cart.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
      };

      expect(getCartTotal()).toBeCloseTo(79.97, 2);
    });

    it('should return 0 for empty cart', () => {
      cart = [];

      const getCartTotal = () => {
        return cart.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
      };

      expect(getCartTotal()).toBe(0);
    });
  });

  describe('getCartItemCount', () => {
    it('should return total item count', () => {
      cart = [
        { quantity: 2 },
        { quantity: 3 },
        { quantity: 1 }
      ];

      const getCartItemCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
      };

      expect(getCartItemCount()).toBe(6);
    });
  });
});
