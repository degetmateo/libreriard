import { ApiClient } from './api.client';
import { ApiResponse, CustomerUserDto } from '@libreriard/shared';

export class CustomerService {
  private readonly client = ApiClient.getInstance();

  public async getCustomers(params?: Record<string, string | number | boolean>): Promise<ApiResponse<CustomerUserDto[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return this.client.request<CustomerUserDto[]>(`/customers${query}`);
  }

  public async reviewWholesale(id: string, approved: boolean): Promise<ApiResponse<CustomerUserDto>> {
    return this.client.request<CustomerUserDto>(`/customers/${id}/review-wholesale`, {
      method: 'PUT',
      body: JSON.stringify({ approved })
    });
  }
}
