import { ApiResponse } from '@libreriard/shared';

export class ApiClient {
  private static instance: ApiClient;
  private accessToken: string | null = null;
  private readonly baseUrl: string;

  private constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
  }

  public static getInstance(): ApiClient {
    if (!ApiClient.instance) ApiClient.instance = new ApiClient();
    return ApiClient.instance;
  }

  public setToken(token: string | null): void {
    this.accessToken = token;
  }

  public getToken(): string | null {
    return this.accessToken;
  }

  public async request<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {})
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include'
    });

    if (response.status === 401 && !endpoint.includes('/refresh') && !endpoint.includes('/login') && !endpoint.includes('/register')) {
      const refreshed = await this.refreshToken();
      if (refreshed) {
        headers['Authorization'] = `Bearer ${this.accessToken}`;
        const retryRes = await fetch(url, { ...options, headers, credentials: 'include' });
        return retryRes.json();
      }
    }

    return response.json();
  }

  private async refreshToken(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/auth/customer/refresh`, {
        method: 'POST',
        credentials: 'include'
      });
      const data: ApiResponse<{ accessToken: string }> = await res.json();
      if (data.success && data.data?.accessToken) {
        this.setToken(data.data.accessToken);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}
