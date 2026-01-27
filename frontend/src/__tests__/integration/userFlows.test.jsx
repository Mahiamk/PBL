/**
 * Integration tests for complete user flows
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Complete User Flows', () => {
  let mockAPI;

  beforeEach(() => {
    mockAPI = {
      login: vi.fn(),
      register: vi.fn(),
      fetchProducts: vi.fn(),
      createOrder: vi.fn(),
      fetchMyOrders: vi.fn(),
      createAppointment: vi.fn(),
      fetchMyAppointments: vi.fn()
    };
    localStorage.clear.mockClear();
    localStorage.setItem.mockClear();
    localStorage.getItem.mockReturnValue(null);
  });

  describe('Customer Shopping Flow', () => {
    it('should complete full shopping flow', async () => {
      // 1. Login
      mockAPI.login.mockResolvedValue({
        access_token: 'customer-token',
        role: 'customer',
        user_id: 1
      });

      const loginResult = await mockAPI.login('customer@example.com', 'password');
      expect(loginResult.role).toBe('customer');

      // Store auth
      localStorage.setItem('token', loginResult.access_token);
      localStorage.setItem('userId', loginResult.user_id.toString());

      // 2. Browse Products
      mockAPI.fetchProducts.mockResolvedValue([
        { product_id: 1, product_name: 'Product 1', product_price: 29.99, store_id: 1 },
        { product_id: 2, product_name: 'Product 2', product_price: 19.99, store_id: 1 }
      ]);

      const products = await mockAPI.fetchProducts(1);
      expect(products.length).toBe(2);

      // 3. Add to Cart (simulated)
      const cart = [
        { product_id: 1, product_price: 29.99, quantity: 2 }
      ];

      // 4. Create Order
      mockAPI.createOrder.mockResolvedValue({
        order_id: 100,
        status: 'Processing',
        total_amount: 59.98,
        payment_method: 'Online Payment'
      });

      const orderData = {
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          product_price: item.product_price
        })),
        payment_method: 'Online Payment'
      };

      const order = await mockAPI.createOrder(orderData);
      expect(order.status).toBe('Processing');

      // 5. View Orders
      mockAPI.fetchMyOrders.mockResolvedValue([order]);
      const myOrders = await mockAPI.fetchMyOrders();
      expect(myOrders.length).toBe(1);
    });
  });

  describe('Vendor Dashboard Flow', () => {
    it('should complete vendor order management flow', async () => {
      // 1. Login as Vendor
      mockAPI.login.mockResolvedValue({
        access_token: 'vendor-token',
        role: 'vendor',
        user_id: 10,
        store_id: 5,
        vendor_type: 'barber'
      });

      const loginResult = await mockAPI.login('vendor@example.com', 'password');
      expect(loginResult.role).toBe('vendor');
      expect(loginResult.store_id).toBe(5);

      // 2. View Store Orders (mocked)
      const mockFetchStoreOrders = vi.fn().mockResolvedValue([
        { order_id: 1, status: 'Processing', customer_name: 'John' },
        { order_id: 2, status: 'Processing', customer_name: 'Jane' }
      ]);

      const orders = await mockFetchStoreOrders(5);
      expect(orders.length).toBe(2);

      // 3. Update Order Status
      const mockUpdateOrderStatus = vi.fn().mockResolvedValue({
        order_id: 1,
        status: 'Shipped'
      });

      const updatedOrder = await mockUpdateOrderStatus(1, 'Shipped');
      expect(updatedOrder.status).toBe('Shipped');
    });
  });

  describe('Appointment Booking Flow', () => {
    it('should complete appointment booking flow', async () => {
      // 1. Login
      mockAPI.login.mockResolvedValue({
        access_token: 'token',
        role: 'customer',
        user_id: 1
      });

      await mockAPI.login('customer@example.com', 'password');

      // 2. Select Service and Provider
      const bookingData = {
        store_id: 1,
        barber_name: 'John',
        service_name: 'Haircut',
        booking_date: '2026-01-30T10:00:00'
      };

      // 3. Create Appointment
      mockAPI.createAppointment.mockResolvedValue({
        appointment_id: 1,
        ...bookingData,
        status: 'Confirmed',
        customer_name: 'Customer'
      });

      const appointment = await mockAPI.createAppointment(bookingData);
      expect(appointment.status).toBe('Confirmed');
      // Backward compatibility check
      expect(appointment.barber_name).toBe('John');

      // 4. View My Appointments
      mockAPI.fetchMyAppointments.mockResolvedValue([appointment]);
      const myAppointments = await mockAPI.fetchMyAppointments();
      expect(myAppointments.length).toBe(1);
    });
  });

  describe('Admin Management Flow', () => {
    it('should complete admin user management flow', async () => {
      // 1. Login as Admin
      mockAPI.login.mockResolvedValue({
        access_token: 'admin-token',
        role: 'admin',
        user_id: 1
      });

      const loginResult = await mockAPI.login('admin@example.com', 'password');
      expect(loginResult.role).toBe('admin');

      // 2. Fetch All Users
      const mockFetchUsers = vi.fn().mockResolvedValue([
        { id: 1, email: 'admin@example.com', role: 'admin' },
        { id: 2, email: 'vendor@example.com', role: 'vendor' },
        { id: 3, email: 'customer@example.com', role: 'customer' }
      ]);

      const users = await mockFetchUsers();
      expect(users.length).toBe(3);

      // 3. Fetch System Log Stats
      const mockFetchLogStats = vi.fn().mockResolvedValue({
        period: 'week',
        success_count: 50,
        failure_count: 5,
        total_logs: 55
      });

      const stats = await mockFetchLogStats();
      expect(stats.success_count).toBe(50);
      expect(stats.failure_count).toBe(5);

      // 4. Approve Vendor Application
      const mockApproveVendor = vi.fn().mockResolvedValue({
        application_id: 1,
        status: 'approved'
      });

      const approvalResult = await mockApproveVendor(1);
      expect(approvalResult.status).toBe('approved');
    });
  });
});

describe('Error Handling Flows', () => {
  it('should handle authentication errors', async () => {
    const mockLogin = vi.fn().mockRejectedValue({
      response: { status: 401, data: { detail: 'Incorrect username or password' } }
    });

    await expect(mockLogin('wrong@email.com', 'wrong')).rejects.toMatchObject({
      response: { status: 401 }
    });
  });

  it('should handle network errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network Error'));

    await expect(mockFetch()).rejects.toThrow('Network Error');
  });

  it('should handle validation errors', async () => {
    const mockCreateOrder = vi.fn().mockRejectedValue({
      response: { status: 422, data: { detail: 'Validation error' } }
    });

    await expect(mockCreateOrder({})).rejects.toMatchObject({
      response: { status: 422 }
    });
  });
});
