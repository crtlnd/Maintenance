// frontend/src/services/api.js
const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const makeRequest = async (url, options = {}) => {
  const token = getAuthToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Asset API functions
export const assetApi = {
  // Get all assets for the current user
  getAssets: async (filters = {}) => {
    const queryParams = new URLSearchParams();

    if (filters.location) queryParams.append('location', filters.location);
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.status) queryParams.append('status', filters.status);

    const queryString = queryParams.toString();
    const url = `/assets${queryString ? `?${queryString}` : ''}`;

    return makeRequest(url);
  },

  // Get a single asset by ID
  getAsset: async (assetId) => {
    return makeRequest(`/assets/${assetId}`);
  },

  // Create a new asset
  createAsset: async (assetData) => {
    return makeRequest('/assets', {
      method: 'POST',
      body: JSON.stringify(assetData),
    });
  },

  // Update an existing asset
  updateAsset: async (assetId, assetData) => {
    return makeRequest(`/assets/${assetId}`, {
      method: 'PUT',
      body: JSON.stringify(assetData),
    });
  },

  // Update asset status only
  updateAssetStatus: async (assetId, status) => {
    return makeRequest(`/assets/${assetId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Delete an asset
  deleteAsset: async (assetId) => {
    return makeRequest(`/assets/${assetId}`, {
      method: 'DELETE',
    });
  },

  // Get dashboard data
  getDashboardData: async () => {
    return makeRequest('/assets/dashboard');
  },

  // Add maintenance task to asset
  addMaintenanceTask: async (assetId, taskData) => {
    return makeRequest(`/assets/${assetId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Update maintenance task
  updateMaintenanceTask: async (assetId, taskId, taskData) => {
    return makeRequest(`/assets/${assetId}/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  // Add FMEA entry
  addFMEA: async (fmeaData) => {
    return makeRequest('/assets/fmea', {
      method: 'POST',
      body: JSON.stringify(fmeaData),
    });
  },
};

// Authentication API functions
export const authApi = {
  login: async (email, password) => {
    return makeRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (userData) => {
    return makeRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!getAuthToken();
  },
};

// User API functions
export const userApi = {
  getProfile: async () => {
    return makeRequest('/users/profile');
  },

  updateProfile: async (userData) => {
    return makeRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
};

// Export default API object
export default {
  assets: assetApi,
  auth: authApi,
  user: userApi,
};
