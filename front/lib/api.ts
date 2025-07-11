import { API_URL } from './config';

export const api = {
  // Base URL for all API calls
  baseURL: API_URL,
  
  // Helper function to make API calls
  async fetch(endpoint: string, options?: RequestInit) {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get token from localStorage if available
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  },
  
  // Specialities endpoints
  specialities: {
    getAll: () => api.fetch('/specialities'),
    getById: (id: number) => api.fetch(`/specialities/${id}`),
    create: (data: { name: string }) => api.fetch('/specialities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: { name?: string }) => api.fetch(`/specialities/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => api.fetch(`/specialities/${id}`, {
      method: 'DELETE',
    }),
  },

  // Restaurants endpoints
  restaurants: {
    getAll: () => api.fetch('/restaurants'),
    getById: (id: number, cacheBuster?: string) => {
      const url = cacheBuster ? `/restaurants/${id}?${cacheBuster}` : `/restaurants/${id}`;
      return api.fetch(url);
    },
    getBySpeciality: (specialityId: number) => api.fetch(`/restaurants?specialityId=${specialityId}`),
    create: (data: any) => api.fetch('/restaurants', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => api.fetch(`/restaurants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => api.fetch(`/restaurants/${id}`, {
      method: 'DELETE',
    }),
  },

  // Auth endpoints
  auth: {
    login: (data: { email: string; password: string }) => api.fetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    register: (data: { firstName: string; lastName: string; email: string; password: string }) => api.fetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    logout: () => api.fetch('/auth/logout', {
      method: 'POST',
    }),
    me: () => api.fetch('/auth/me'),
    profile: () => api.fetch('/auth/profile'),
  },

  // Addresses endpoints
  addresses: {
    getAll: () => api.fetch('/addresses'),
    getById: (id: number) => api.fetch(`/addresses/${id}`),
    create: (data: any) => api.fetch('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
    update: (id: number, data: any) => api.fetch(`/addresses/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
    delete: (id: number) => api.fetch(`/addresses/${id}`, {
      method: 'DELETE',
    }),
    // API Adresse integration (French government)
    searchApiAdresse: (query: string, limit?: number) => api.fetch(`/addresses/search/api-adresse?query=${encodeURIComponent(query)}${limit ? `&limit=${limit}` : ''}`),
    getApiAdresseAddress: (id: string) => api.fetch(`/addresses/api-adresse/${id}`),
    createFromApiAdresse: (id: string) => api.fetch(`/addresses/api-adresse/${id}`, {
      method: 'POST',
    }),
    createFromFeature: (feature: any) => api.fetch('/addresses/from-feature', {
      method: 'POST',
      body: JSON.stringify(feature),
    }),
    searchByCoordinates: (lat: number, lon: number, limit?: number) => api.fetch(`/addresses/search/coordinates?lat=${lat}&lon=${lon}${limit ? `&limit=${limit}` : ''}`),
  },

  // Users endpoints
  users: {
    getById: (id: number) => api.fetch(`/users/${id}`),
    update: (id: number, data: { firstName?: string; lastName?: string; password?: string }) => api.fetch(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  },
}; 