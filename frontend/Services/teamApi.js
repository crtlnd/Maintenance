const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};

export const teamApi = {
  // Get team members
  async getMembers() {
    const response = await fetch(`${API_BASE_URL}/team/members`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Create team invitation
  async inviteMember(email, role = 'technician') {
    const response = await fetch(`${API_BASE_URL}/team/invite`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ email, role })
    });
    return handleResponse(response);
  },

  // Get pending invitations
  async getInvitations() {
    const response = await fetch(`${API_BASE_URL}/team/invitations`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update member role
  async updateMemberRole(memberId, role) {
    const response = await fetch(`${API_BASE_URL}/team/members/${memberId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role })
    });
    return handleResponse(response);
  },

  // Remove team member
  async removeMember(memberId) {
    const response = await fetch(`${API_BASE_URL}/team/members/${memberId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Cancel invitation
  async cancelInvitation(invitationId) {
    const response = await fetch(`${API_BASE_URL}/team/invitations/${invitationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Join organization via token
  async joinOrganization(token) {
    const response = await fetch(`${API_BASE_URL}/team/join`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ token })
    });
    return handleResponse(response);
  }
};

export const organizationApi = {
  // Create organization
  async createOrganization(name, type = 'internal') {
    const response = await fetch(`${API_BASE_URL}/organization/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, type })
    });
    return handleResponse(response);
  },

  // Get organization info
  async getOrganizationInfo() {
    const response = await fetch(`${API_BASE_URL}/organization/info`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Update organization settings
  async updateSettings(name, settings) {
    const response = await fetch(`${API_BASE_URL}/organization/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ name, settings })
    });
    return handleResponse(response);
  },

  // Leave organization
  async leaveOrganization() {
    const response = await fetch(`${API_BASE_URL}/organization/leave`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Delete organization
  async deleteOrganization() {
    const response = await fetch(`${API_BASE_URL}/organization/delete`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  },

  // Get organization dashboard
  async getDashboard() {
    const response = await fetch(`${API_BASE_URL}/organization/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    return handleResponse(response);
  }
};

// Helper function to copy invite URL to clipboard
export const copyInviteUrl = async (url) => {
  try {
    await navigator.clipboard.writeText(url);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = url;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    return true;
  }
};

export default { teamApi, organizationApi, copyInviteUrl };
