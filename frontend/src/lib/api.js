// Newsletter
export const subscribeNewsletter = async (email) => {
  const response = await API.post('/api/newsletter/subscribe', { email });
  return response.data;
};
import axios from 'axios';

const API = axios.create({
    baseURL: 'http://localhost:8000', // Connects to FastAPI
    withCredentials: true,
});

// Add a request interceptor to include the token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add a response interceptor to handle 401 errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userId');
      localStorage.removeItem('storeId');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const login = async (username, password) => {
  const formData = new FormData();
  formData.append('username', username);
  formData.append('password', password);
  const response = await API.post('/api/v1/auth/token', formData);
  return response.data;
};

export const register = async (userData) => {
  const response = await API.post('/api/v1/auth/register', userData);
  return response.data;
};

export const registerVendor = async (vendorData) => {
  const response = await API.post('/api/v1/auth/register/vendor', vendorData);
  return response.data;
};



export const updateProfile = async (formData) => {
  const response = await API.put('/api/v1/users/me', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchAdminDashboard = async () => {
  const response = await API.get('/api/v1/users/admin/dashboard');
  return response.data;
};

export const fetchVendorDashboard = async (vendorId) => {
  // REMOVED: ?t=${new Date().getTime()} to prevent infinite log spam and cache-busting loops
  const response = await API.get(`/api/v1/users/vendor/dashboard/${vendorId}`);
  return response.data;
};

export const fetchCustomerDashboard = async (customerId) => {
  const response = await API.get(`/api/v1/users/customer/dashboard/${customerId}`);
  return response.data;
};

export const fetchStores = async () => {
    const response = await API.get('/api/stores/');
    return response.data;
};

export const fetchStoreById = async (storeId) => {
  const response = await API.get(`/api/stores/${storeId}`);
  return response.data;
};

export const fetchProducts = async (storeId = null) => {
  const url = storeId ? `/api/products?store_id=${storeId}` : '/api/products';
  const response = await API.get(url);
  return response.data;
};

export const fetchProductById = async (productId) => {
  const response = await API.get(`/api/products/${productId}`);
  return response.data;
};

export const createOrder = async (orderData) => {
  const response = await API.post('/api/orders/', orderData);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await API.put(`/api/orders/${orderId}/status`, { status });
  return response.data;
};

export const deleteOrder = async (orderId) => {
    const response = await API.delete(`/api/orders/${orderId}`);
    return response.data;
};

export const createProduct = async (productData) => {
  const response = await API.post('/api/products', productData);
  return response.data;
};

export const createService = async (serviceData) => {
  const response = await API.post('/api/services/', serviceData);
  return response.data;
};

export const updateProduct = async (productId, productData) => {
  const response = await API.put(`/api/products/${productId}`, productData);
  return response.data;
};

export const deleteProduct = async (productId) => {
  const response = await API.delete(`/api/products/${productId}`);
  return response.data;
};

export const createCategory = async (categoryData) => {
  const response = await API.post('/api/products/categories', categoryData);
  return response.data;
};

export const fetchCategories = async (storeId = null) => {
  const url = storeId ? `/api/products/categories?store_id=${storeId}` : '/api/products/categories';
  const response = await API.get(url);
  return response.data;
};

export const deleteCategory = async (categoryId) => {
  const response = await API.delete(`/api/products/categories/${categoryId}`);
  return response.data;
};

export const createAttribute = async (attributeData) => {
  const response = await API.post('/api/products/attributes', attributeData);
  return response.data;
};

export const createVariant = async (variantData) => {
  const response = await API.post('/api/products/variants', variantData);
  return response.data;
};

export const createAppointment = async (appointmentData) => {
  const response = await API.post('/api/appointments/', appointmentData);
  return response.data;
};

export const fetchMyAppointments = async () => {
  const response = await API.get('/api/appointments/my-appointments');
  return response.data;
};

export const cancelAppointment = async (appointmentId) => {
  const response = await API.put(`/api/appointments/${appointmentId}/cancel`);
  return response.data;
};

export const createReview = async (reviewData) => {
  const response = await API.post('/api/reviews/', reviewData);
  return response.data;
};

export const fetchReviews = async (storeId, barberName = null) => {
  let url = `/api/reviews/?store_id=${storeId}`;
  if (barberName) {
    url += `&barber_name=${encodeURIComponent(barberName)}`;
  }
  const response = await API.get(url);
  return response.data;
};

export const uploadImage = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await API.post('/api/products/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const uploadChatAttachment = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await API.post('/api/messages/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const fetchVendorApplications = async () => {
  const response = await API.get('/api/admin/vendor-applications');
  return response.data;
};

export const fetchUsers = async () => {
  const response = await API.get('/api/admin/users');
  return response.data;
};

export const approveVendor = async (appId) => {
  const response = await API.put(`/api/admin/vendor-applications/${appId}/approve`);
  return response.data;
};

export const rejectVendor = async (appId) => {
  const response = await API.put(`/api/admin/vendor-applications/${appId}/reject`);
  return response.data;
};

export const deleteUser = async (userId) => {
  const response = await API.delete(`/api/admin/users/${userId}`);
  return response.data;
};

export const fetchStoreAppointments = async (storeId) => {
  const response = await API.get(`/api/appointments/store/${storeId}`);
  return response.data;
};

export const fetchServices = async (storeId = null) => {
  const url = storeId ? `/api/services/?store_id=${storeId}` : '/api/services/';
  const response = await API.get(url);
  return response.data;
};

export const updateService = async (serviceId, serviceData) => {
  const response = await API.put(`/api/services/${serviceId}`, serviceData);
  return response.data;
};

export const deleteService = async (serviceId) => {
  const response = await API.delete(`/api/services/${serviceId}`);
  return response.data;
};

// Messaging
export const fetchConversations = async () => {
  const response = await API.get('/api/messages/conversations');
  return response.data;
};

// Notifications
export const fetchNotifications = async () => {
  const response = await API.get('/api/notifications/');
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await API.put(`/api/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await API.put('/api/notifications/read-all');
  return response.data;
};

export const updateAppointmentStatus = async (appointmentId, status) => {
  const response = await API.put(`/api/appointments/${appointmentId}/status`, { status });
  return response.data;
};

export const fetchChatHistory = async (userId) => {
  const response = await API.get(`/api/messages/${userId}`);
  return response.data;
};

export const sendMessage = async (messageData) => {
  const response = await API.post('/api/messages/', messageData);
  return response.data;
};

export const markMessagesAsRead = async (senderId) => {
  const response = await API.put(`/api/messages/read/${senderId}`);
  return response.data;
};

export default API;