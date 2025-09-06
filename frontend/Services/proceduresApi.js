// frontend/src/services/proceduresApi.js
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

// Procedures API functions
export const proceduresApi = {
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
  }
};

export default proceduresApi;
