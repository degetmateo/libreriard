import { ApiClient } from './api.client';
import { ApiResponse, AuthTokensDto, LoginRequestDto, StaffUserDto } from '@libreriard/shared';

export class StaffAuthService {
  private readonly client = ApiClient.getInstance();

  public async login(dto: LoginRequestDto): Promise<ApiResponse<AuthTokensDto>> {
    const res = await this.client.request<AuthTokensDto>('/auth/staff/login', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
    if (res.success && res.data?.accessToken) {
      this.client.setToken(res.data.accessToken);
    }
    return res;
  }

  public async refresh(): Promise<ApiResponse<{ accessToken: string }>> {
    const res = await this.client.request<{ accessToken: string }>('/auth/staff/refresh', {
      method: 'POST'
    });
    if (res.success && res.data?.accessToken) {
      this.client.setToken(res.data.accessToken);
    }
    return res;
  }

  public async logout(): Promise<ApiResponse<void>> {
    const res = await this.client.request<void>('/auth/staff/logout', { method: 'POST' });
    this.client.setToken(null);
    return res;
  }

  public async getProfile(): Promise<ApiResponse<StaffUserDto>> {
    return this.client.request<StaffUserDto>('/auth/staff/me');
  }
}

