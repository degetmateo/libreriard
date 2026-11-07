import { ApiClient } from './api.client';
import { ApiResponse, OrderDto, OrderStatus } from '@libreriard/shared';

export class OrderService {
  private readonly client = ApiClient.getInstance();

  public async getOrders(params?: Record<string, string | number>): Promise<ApiResponse<OrderDto[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return this.client.request<OrderDto[]>(`/orders${query}`);
  }

  public async updateOrderStatus(id: string, status: OrderStatus, notes?: string): Promise<ApiResponse<OrderDto>> {
    return this.client.request<OrderDto>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  }
}

