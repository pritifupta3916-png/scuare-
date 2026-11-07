import { SparePart, User, SearchLog, AdminStats } from './types';

const getHeaders = () => {
  const token = localStorage.getItem('mobilix_auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

export const api = {
  // Auth
  async signup(data: { name: string; email: string; phone: string; password: string }) {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Signup failed');
    return result;
  },

  async login(data: { identifier: string; password: string }) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Login failed');
    return result;
  },

  async getMe() {
    const res = await fetch('/api/auth/me', {
      headers: getHeaders(),
    });
    if (!res.ok) return null;
    const result = await res.json();
    return result.user as User;
  },

  // Parts
  async getParts(filters?: {
    query?: string;
    brand?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    sort?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.query) params.append('query', filters.query);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
    if (filters?.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
    if (filters?.inStock) params.append('inStock', 'true');
    if (filters?.sort) params.append('sort', filters.sort);

    const res = await fetch(`/api/parts?${params.toString()}`);
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch parts');
    return result.parts as SparePart[];
  },

  async getBrands() {
    const res = await fetch('/api/brands');
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch brands');
    return result.brands as { name: string; count: number }[];
  },

  async createPart(partData: Partial<SparePart>) {
    const res = await fetch('/api/parts', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(partData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to create part');
    return result.part as SparePart;
  },

  async updatePart(id: string, partData: Partial<SparePart>) {
    const res = await fetch(`/api/parts/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(partData),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update part');
    return result.part as SparePart;
  },

  async deletePart(id: string) {
    const res = await fetch(`/api/parts/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to delete part');
    return true;
  },

  // Search Logging
  async logSearch(data: { query: string; brandFilter?: string; categoryFilter?: string; resultsCount: number }) {
    try {
      await fetch('/api/search-log', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      });
    } catch (e) {
      console.warn('Logging silent failure:', e);
    }
  },

  // Admin Endpoints
  async getAdminUsers() {
    const res = await fetch('/api/admin/users', { headers: getHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch admin users');
    return result.users as User[];
  },

  async updateUserRole(id: string, role: string) {
    const res = await fetch(`/api/admin/users/${id}/role`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ role }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update user role');
    return true;
  },

  async toggleUserStatus(id: string) {
    const res = await fetch(`/api/admin/users/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to toggle user status');
    return result.user as User;
  },

  async getAdminSearchLogs(filters?: { suspiciousOnly?: boolean; query?: string }) {
    const params = new URLSearchParams();
    if (filters?.suspiciousOnly) params.append('suspiciousOnly', 'true');
    if (filters?.query) params.append('query', filters.query);

    const res = await fetch(`/api/admin/search-logs?${params.toString()}`, { headers: getHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch search logs');
    return result.logs as SearchLog[];
  },

  async toggleLogSuspicious(logId: string) {
    const res = await fetch('/api/admin/toggle-suspicious', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ logId }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to update log');
    return result.log as SearchLog;
  },

  async clearLogs() {
    const res = await fetch('/api/admin/clear-logs', {
      method: 'POST',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to clear logs');
    return true;
  },

  async getAdminStats() {
    const res = await fetch('/api/admin/stats', { headers: getHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch admin stats');
    return result.stats as AdminStats;
  },

  async getSchema() {
    const res = await fetch('/api/admin/schema', { headers: getHeaders() });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'Failed to fetch database schema');
    return result.schema;
  },

  // AI Endpoints
  async checkAICompatibility(partName: string, partBrand: string, targetModel: string, issueDescription?: string) {
    const res = await fetch('/api/ai/compatibility-check', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ partName, partBrand, targetModel, issueDescription }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'AI compatibility check failed');
    return result.analysis as string;
  },

  async diagnoseIssue(symptoms: string, phoneBrand?: string, phoneModel?: string) {
    const res = await fetch('/api/ai/diagnose-issue', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ symptoms, phoneBrand, phoneModel }),
    });
    const result = await res.json();
    if (!res.ok) throw new Error(result.error || 'AI diagnostic failed');
    return result.diagnosis as string;
  }
};
