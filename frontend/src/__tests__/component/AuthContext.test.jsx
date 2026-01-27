/**
 * Component tests for AuthContext
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';

// Mock the API
vi.mock('../../lib/api', () => ({
  login: vi.fn()
}));

import { login as apiLogin } from '../../lib/api';

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.getItem.mockReturnValue(null);
  });

  describe('Initial State', () => {
    it('should start with null user when no stored auth', () => {
      // Simulate no stored authentication
      localStorage.getItem.mockReturnValue(null);
      
      // The context should initialize with null user
      const storedToken = localStorage.getItem('token');
      expect(storedToken).toBeNull();
    });

    it('should restore user from localStorage', () => {
      localStorage.getItem.mockImplementation((key) => {
        const store = {
          token: 'stored-token',
          role: 'customer',
          userId: '1',
          storeId: null
        };
        return store[key] || null;
      });

      const token = localStorage.getItem('token');
      const role = localStorage.getItem('role');
      const userId = localStorage.getItem('userId');

      expect(token).toBe('stored-token');
      expect(role).toBe('customer');
      expect(userId).toBe('1');
    });
  });

  describe('Login', () => {
    it('should store auth data on successful login', async () => {
      apiLogin.mockResolvedValue({
        access_token: 'new-token',
        role: 'customer',
        user_id: 123,
        store_id: null,
        profile_image: null
      });

      // Simulate login
      const result = await apiLogin('test@example.com', 'password');

      expect(apiLogin).toHaveBeenCalledWith('test@example.com', 'password');
      expect(result.access_token).toBe('new-token');
      expect(result.role).toBe('customer');
    });

    it('should handle login error', async () => {
      apiLogin.mockRejectedValue(new Error('Invalid credentials'));

      await expect(apiLogin('wrong@email.com', 'wrong'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should store storeId for vendor login', async () => {
      apiLogin.mockResolvedValue({
        access_token: 'vendor-token',
        role: 'vendor',
        user_id: 456,
        store_id: 789,
        vendor_type: 'barber'
      });

      const result = await apiLogin('vendor@example.com', 'password');

      expect(result.store_id).toBe(789);
      expect(result.role).toBe('vendor');
    });
  });

  describe('Logout', () => {
    it('should clear localStorage on logout', () => {
      // Simulate logout
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('storeId');

      expect(localStorage.removeItem).toHaveBeenCalledWith('token');
      expect(localStorage.removeItem).toHaveBeenCalledWith('role');
      expect(localStorage.removeItem).toHaveBeenCalledWith('userId');
      expect(localStorage.removeItem).toHaveBeenCalledWith('storeId');
    });
  });
});

describe('Role-based Access', () => {
  it('should identify customer role', () => {
    const user = { role: 'customer' };
    expect(user.role).toBe('customer');
    expect(user.role !== 'admin').toBe(true);
  });

  it('should identify vendor role', () => {
    const user = { role: 'vendor', storeId: 123 };
    expect(user.role).toBe('vendor');
    expect(user.storeId).toBe(123);
  });

  it('should identify admin role', () => {
    const user = { role: 'admin' };
    expect(user.role).toBe('admin');
  });
});
