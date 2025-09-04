// frontend/Services/adminApi.js
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class AdminApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Helper method for authenticated requests
  async authenticatedRequest(endpoint, options = {}) {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken') || localStorage.getItem('adminToken');

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${this.baseURL}${endpoint}`, config);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Dashboard & Analytics
  async getDashboardStats() {
    return this.authenticatedRequest('/admin/dashboard');
  }

  async getAnalytics(timeRange = '30d') {
    return this.authenticatedRequest(`/admin/analytics?range=${timeRange}`);
  }

  async getMetrics() {
    return this.authenticatedRequest('/admin/metrics');
  }

  // Users Management
  async getUsers(page = 1, limit = 50) {
    return this.authenticatedRequest(`/admin/users?page=${page}&limit=${limit}`);
  }

  async getUserById(userId) {
    return this.authenticatedRequest(`/admin/users/${userId}`);
  }

  async updateUser(userId, userData) {
    return this.authenticatedRequest(`/admin/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async updateUserStatus(userId, status) {
    return this.authenticatedRequest(`/admin/users/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async deleteUser(userId) {
    return this.authenticatedRequest(`/admin/users/${userId}`, {
      method: 'DELETE',
    });
  }

  // Assets Management
  async getAssets(page = 1, limit = 50) {
    return this.authenticatedRequest(`/admin/assets?page=${page}&limit=${limit}`);
  }

  async getAssetById(assetId) {
    return this.authenticatedRequest(`/admin/assets/${assetId}`);
  }

  async updateAsset(assetId, assetData) {
    return this.authenticatedRequest(`/admin/assets/${assetId}`, {
      method: 'PUT',
      body: JSON.stringify(assetData),
    });
  }

  // Providers Management
  async getProviders(page = 1, limit = 50) {
    return this.authenticatedRequest(`/admin/providers?page=${page}&limit=${limit}`);
  }

  async createProvider(providerData) {
    return this.authenticatedRequest('/admin/providers', {
      method: 'POST',
      body: JSON.stringify(providerData),
    });
  }

  async updateProvider(providerId, providerData) {
    return this.authenticatedRequest(`/admin/providers/${providerId}`, {
      method: 'PUT',
      body: JSON.stringify(providerData),
    });
  }

  async deleteProvider(providerId) {
    return this.authenticatedRequest(`/admin/providers/${providerId}`, {
      method: 'DELETE',
    });
  }

  // Payments/Transactions
  async getPayments(page = 1, limit = 50) {
    return this.authenticatedRequest(`/admin/payments?page=${page}&limit=${limit}`);
  }

  async getPaymentById(paymentId) {
    return this.authenticatedRequest(`/admin/payments/${paymentId}`);
  }

  // Matching Algorithm
  async getMatchingConfig() {
    return this.authenticatedRequest('/admin/matching/config');
  }

  async updateMatchingConfig(config) {
    return this.authenticatedRequest('/admin/matching/config', {
      method: 'PUT',
      body: JSON.stringify(config),
    });
  }

  // System Health
  async getSystemHealth() {
    return this.authenticatedRequest('/health');
  }
}

export default new AdminApiService();
