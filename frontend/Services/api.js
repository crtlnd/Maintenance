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

  // Add maintenance task to asset (legacy - for asset-specific tasks)
  addMaintenanceTask: async (assetId, taskData) => {
    return makeRequest(`/assets/${assetId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Update maintenance task (legacy - for asset-specific tasks)
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

// Maintenance Tasks API functions
export const maintenanceApi = {
  // Get all maintenance tasks for the current user
  getTasks: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.assetId) queryParams.append('assetId', filters.assetId);
    if (filters.status) queryParams.append('status', filters.status);
    if (filters.priority) queryParams.append('priority', filters.priority);
    if (filters.taskType) queryParams.append('taskType', filters.taskType);
    const queryString = queryParams.toString();
    const url = `/maintenance/tasks${queryString ? `?${queryString}` : ''}`;
    return makeRequest(url);
  },

  // Get a single maintenance task by ID
  getTask: async (taskId) => {
    return makeRequest(`/maintenance/tasks/${taskId}`);
  },

  // Create a new maintenance task
  createTask: async (taskData) => {
    return makeRequest('/maintenance/tasks', {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },

  // Update an existing maintenance task
  updateTask: async (taskId, taskData) => {
    return makeRequest(`/maintenance/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(taskData),
    });
  },

  // Complete a maintenance task
  completeTask: async (taskId, completionData) => {
    return makeRequest(`/maintenance/tasks/${taskId}/complete`, {
      method: 'PUT',
      body: JSON.stringify(completionData),
    });
  },

  // Delete a maintenance task
  deleteTask: async (taskId) => {
    return makeRequest(`/maintenance/tasks/${taskId}`, {
      method: 'DELETE',
    });
  },

  // Get maintenance tasks for a specific asset
  getTasksForAsset: async (assetId) => {
    return makeRequest(`/maintenance/tasks?assetId=${assetId}`);
  },

  // Get overdue tasks
  getOverdueTasks: async () => {
    return makeRequest('/maintenance/tasks?status=overdue');
  },

  // Get tasks due soon (within next 7 days)
  getTasksDueSoon: async () => {
    return makeRequest('/maintenance/tasks/due-soon');
  },

  // Get maintenance dashboard data
  getDashboardData: async () => {
    return makeRequest('/maintenance/dashboard');
  }
};

// Procedure API functions
export const procedureApi = {
  // Get all procedures for a specific asset
  getProceduresForAsset: async (assetId) => {
    return makeRequest(`/procedures/asset/${assetId}`);
  },

  // Create a new procedure
  createProcedure: async (procedureData) => {
    return makeRequest('/procedures', {
      method: 'POST',
      body: JSON.stringify(procedureData),
    });
  },

  // Update an existing procedure
  updateProcedure: async (procedureId, procedureData) => {
    return makeRequest(`/procedures/${procedureId}`, {
      method: 'PUT',
      body: JSON.stringify(procedureData),
    });
  },

  // Delete a procedure
  deleteProcedure: async (procedureId) => {
    return makeRequest(`/procedures/${procedureId}`, {
      method: 'DELETE',
    });
  },

  // Generate AI procedures for an asset
  generateAIProcedures: async (assetId) => {
    return makeRequest(`/procedures/generate/${assetId}`, {
      method: 'POST',
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

// Service Providers API functions (if you need this)
export const providersApi = {
  getProviders: async (filters = {}) => {
    const queryParams = new URLSearchParams();
    if (filters.type) queryParams.append('type', filters.type);
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.services) queryParams.append('services', filters.services);
    const queryString = queryParams.toString();
    const url = `/providers${queryString ? `?${queryString}` : ''}`;
    return makeRequest(url);
  },

  getProvider: async (providerId) => {
    return makeRequest(`/providers/${providerId}`);
  },

  contactProvider: async (providerId, contactData) => {
    return makeRequest(`/providers/${providerId}/contact`, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }
};

// Export default API object
export default {
  assets: assetApi,
  maintenance: maintenanceApi,
  procedures: procedureApi,
  auth: authApi,
  user: userApi,
  providers: providersApi,
};
