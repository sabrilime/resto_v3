import { API_URL } from './config';

export const api = {
  // Base URL for all API calls
  baseURL: API_URL,
  
  // Helper function to make API calls
  async fetch(endpoint: string, options?: RequestInit) {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`API call failed: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
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
    getById: (id: number) => api.fetch(`/restaurants/${id}`),
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
}; 