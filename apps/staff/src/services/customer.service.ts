import { ApiClient } from './api.client';
import { ApiResponse, CustomerUserDto, AdminUpdateCustomerDto } from '@libreriard/shared';

export class CustomerService {
  private readonly client = ApiClient.getInstance();

  public async getCustomers(params?: Record<string, string | number | boolean>): Promise<ApiResponse<CustomerUserDto[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return this.client.request<CustomerUserDto[]>(`/customers${query}`);
  }

  public async updateCustomer(id: string, dto: AdminUpdateCustomerDto): Promise<ApiResponse<CustomerUserDto>> {
    return this.client.request<CustomerUserDto>(`/customers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto)
    });
  }

  public async resetPassword(id: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.client.request<void>(`/customers/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
  }

  public async toggleActive(id: string): Promise<ApiResponse<CustomerUserDto>> {
    return this.client.request<CustomerUserDto>(`/customers/${id}/toggle-active`, {
      method: 'PATCH'
    });
  }

  public async reviewWholesale(id: string, approved: boolean): Promise<ApiResponse<CustomerUserDto>> {
    return this.client.request<CustomerUserDto>(`/customers/${id}/review-wholesale`, {
      method: 'PUT',
      body: JSON.stringify({ approved })
    });
  }
}
