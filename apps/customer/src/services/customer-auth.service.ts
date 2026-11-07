import { ApiClient } from './api.client';
import { ApiResponse, AuthTokensDto, LoginRequestDto, CustomerRegisterRequestDto, CustomerUserDto } from '@libreriard/shared';

export class CustomerAuthService {
  private readonly client = ApiClient.getInstance();

  public async register(dto: CustomerRegisterRequestDto): Promise<ApiResponse<CustomerUserDto>> {
    return this.client.request<CustomerUserDto>('/auth/customer/register', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  public async activateAccount(token: string): Promise<ApiResponse<void>> {
    return this.client.request<void>('/auth/customer/activate', {
      method: 'POST',
      body: JSON.stringify({ token })
    });
  }

  public async login(dto: LoginRequestDto): Promise<ApiResponse<AuthTokensDto>> {
    const res = await this.client.request<AuthTokensDto>('/auth/customer/login', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
    if (res.success && res.data?.accessToken) {
      this.client.setToken(res.data.accessToken);
    }
    return res;
  }

  public async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.client.request<void>('/auth/customer/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  }

  public async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.client.request<void>('/auth/customer/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword })
    });
  }

  public async refresh(): Promise<ApiResponse<{ accessToken: string }>> {
    const res = await this.client.request<{ accessToken: string }>('/auth/customer/refresh', {
      method: 'POST'
    });
    if (res.success && res.data?.accessToken) {
      this.client.setToken(res.data.accessToken);
    }
    return res;
  }

  public async logout(): Promise<ApiResponse<void>> {
    const res = await this.client.request<void>('/auth/customer/logout', { method: 'POST' });
    this.client.setToken(null);
    return res;
  }
}
