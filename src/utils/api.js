import { authConfig } from '../config/auth';
import { useAuthStore } from '../stores/authStore';

const API_URL = authConfig.apiUrl;

/**
 * Make authenticated API request
 */
async function apiRequest(path, options = {}) {
  const accessToken = useAuthStore.getState().getAccessToken();

  if (!accessToken) {
    throw new Error('Not authenticated');
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      ...options.headers,
    },
  });

  if (response.status === 401) {
    // Token expired or invalid - trigger logout
    useAuthStore.getState().logout();
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error || `API error: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}

/**
 * Diagram API methods
 */
export const diagramsApi = {
  // List all user's diagrams (metadata only)
  async list() {
    const data = await apiRequest('/diagrams');
    return data.diagrams;
  },

  // Get single diagram with full content
  async get(id) {
    return apiRequest(`/diagrams/${id}`);
  },

  // Create new diagram
  async create(diagram) {
    return apiRequest('/diagrams', {
      method: 'POST',
      body: JSON.stringify(diagram),
    });
  },

  // Update existing diagram
  async update(id, diagram) {
    return apiRequest(`/diagrams/${id}`, {
      method: 'PUT',
      body: JSON.stringify(diagram),
    });
  },

  // Delete diagram
  async delete(id) {
    return apiRequest(`/diagrams/${id}`, {
      method: 'DELETE',
    });
  },
};
