/**
 * Unit tests for utility functions
 */
import { describe, it, expect, vi } from 'vitest';

// Mock the cn utility (class name merger)
const cn = (...classes) => classes.filter(Boolean).join(' ');

describe('cn utility', () => {
  it('should merge class names', () => {
    const result = cn('class1', 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should filter out falsy values', () => {
    const result = cn('class1', false, null, undefined, 'class2');
    expect(result).toBe('class1 class2');
  });

  it('should return empty string for no classes', () => {
    const result = cn();
    expect(result).toBe('');
  });

  it('should handle conditional classes', () => {
    const isActive = true;
    const isDisabled = false;
    const result = cn('base', isActive && 'active', isDisabled && 'disabled');
    expect(result).toBe('base active');
  });
});

describe('Price formatting', () => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  it('should format price correctly', () => {
    expect(formatPrice(29.99)).toBe('$29.99');
  });

  it('should format whole numbers', () => {
    expect(formatPrice(100)).toBe('$100.00');
  });

  it('should handle zero', () => {
    expect(formatPrice(0)).toBe('$0.00');
  });
});

describe('Cart calculations', () => {
  const calculateTotal = (items) => {
    return items.reduce((sum, item) => sum + (item.product_price * item.quantity), 0);
  };

  it('should calculate total correctly', () => {
    const items = [
      { product_price: 10, quantity: 2 },
      { product_price: 25, quantity: 1 }
    ];
    expect(calculateTotal(items)).toBe(45);
  });

  it('should return 0 for empty cart', () => {
    expect(calculateTotal([])).toBe(0);
  });

  it('should handle single item', () => {
    const items = [{ product_price: 99.99, quantity: 3 }];
    expect(calculateTotal(items)).toBeCloseTo(299.97, 2);
  });
});

describe('Date formatting', () => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  it('should format date correctly', () => {
    const result = formatDate('2026-01-25');
    expect(result).toContain('Jan');
    expect(result).toContain('25');
    expect(result).toContain('2026');
  });
});

describe('Validation helpers', () => {
  const isValidEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  it('should validate correct email', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid email', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });

  const isValidPassword = (password) => {
    return password.length >= 8;
  };

  it('should validate password length', () => {
    expect(isValidPassword('short')).toBe(false);
    expect(isValidPassword('longenough')).toBe(true);
  });
});
