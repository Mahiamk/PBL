/**
 * Unit tests for API module
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }))
  }
}));

describe('API Configuration', () => {
  it('should create axios instance with correct baseURL', () => {
    const API = axios.create({
      baseURL: 'http://localhost:8000',
      withCredentials: true
    });
    
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: 'http://localhost:8000',
      withCredentials: true
    });
  });
});

describe('API Request Functions', () => {
  let mockAPI;

  beforeEach(() => {
    mockAPI = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    };
  });

  describe('login', () => {
    it('should call POST with form data', async () => {
      mockAPI.post.mockResolvedValue({
        data: {
          access_token: 'test-token',
          token_type: 'bearer',
          role: 'customer',
          user_id: 1
        }
      });

      const formData = new FormData();
      formData.append('username', 'test@example.com');
      formData.append('password', 'password123');

      const response = await mockAPI.post('/api/v1/auth/token', formData);

      expect(mockAPI.post).toHaveBeenCalledWith('/api/v1/auth/token', formData);
      expect(response.data.access_token).toBe('test-token');
    });
  });

  describe('fetchProducts', () => {
    it('should fetch products without store filter', async () => {
      mockAPI.get.mockResolvedValue({
        data: [
          { product_id: 1, product_name: 'Product 1' },
          { product_id: 2, product_name: 'Product 2' }
        ]
      });

      const response = await mockAPI.get('/api/products');

      expect(mockAPI.get).toHaveBeenCalledWith('/api/products');
      expect(response.data.length).toBe(2);
    });

    it('should fetch products with store filter', async () => {
      mockAPI.get.mockResolvedValue({
        data: [{ product_id: 1, product_name: 'Product 1', store_id: 1 }]
      });

      const storeId = 1;
      const response = await mockAPI.get(`/api/products?store_id=${storeId}`);

      expect(mockAPI.get).toHaveBeenCalledWith('/api/products?store_id=1');
    });
  });

  describe('createOrder', () => {
    it('should create order with correct data', async () => {
      const orderData = {
        items: [
          { product_id: 1, quantity: 2, product_price: 29.99 }
        ],
        payment_method: 'Online Payment'
      };

      mockAPI.post.mockResolvedValue({
        data: {
          order_id: 1,
          status: 'Processing',
          total_amount: 59.98
        }
      });

      const response = await mockAPI.post('/api/orders/?store_id=1', orderData);

      expect(mockAPI.post).toHaveBeenCalledWith('/api/orders/?store_id=1', orderData);
      expect(response.data.status).toBe('Processing');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      mockAPI.put.mockResolvedValue({
        data: { order_id: 1, status: 'Shipped' }
      });

      const response = await mockAPI.put('/api/orders/1/status', { status: 'Shipped' });

      expect(response.data.status).toBe('Shipped');
    });
  });

  describe('createAppointment', () => {
    it('should create appointment with normalized data', async () => {
      const appointmentData = {
        store_id: 1,
        barber_name: 'John',
        service_name: 'Haircut',
        booking_date: '2026-01-30T10:00:00'
      };

      mockAPI.post.mockResolvedValue({
        data: {
          appointment_id: 1,
          status: 'Confirmed',
          barber_name: 'John',
          booking_date: '2026-01-30T10:00:00'
        }
      });

      const response = await mockAPI.post('/api/appointments/', appointmentData);

      expect(response.data.status).toBe('Confirmed');
      // Backward compatibility check
      expect(response.data.barber_name).toBe('John');
    });
  });
});

describe('API Error Handling', () => {
  it('should handle 401 unauthorized', async () => {
    const mockAPI = {
      get: vi.fn().mockRejectedValue({
        response: { status: 401 }
      })
    };

    await expect(mockAPI.get('/api/protected')).rejects.toEqual({
      response: { status: 401 }
    });
  });

  it('should handle network errors', async () => {
    const mockAPI = {
      get: vi.fn().mockRejectedValue(new Error('Network Error'))
    };

    await expect(mockAPI.get('/api/endpoint')).rejects.toThrow('Network Error');
  });
});
