import { ApiClient } from './api.client';
import { ApiResponse, OrderDto, OrderStatus, CreateManualOrderDto, BusinessStatisticsDto } from '@libreriard/shared';

export class OrderService {
  private readonly client = ApiClient.getInstance();

  public async getOrders(params?: Record<string, string | number>): Promise<ApiResponse<OrderDto[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return this.client.request<OrderDto[]>(`/orders${query}`);
  }

  public async getStatistics(): Promise<ApiResponse<BusinessStatisticsDto>> {
    return this.client.request<BusinessStatisticsDto>('/orders/statistics');
  }

  public async createManualOrder(dto: CreateManualOrderDto): Promise<ApiResponse<OrderDto>> {
    return this.client.request<OrderDto>('/orders/manual', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  public async updateOrderStatus(id: string, status: OrderStatus, notes?: string): Promise<ApiResponse<OrderDto>> {
    return this.client.request<OrderDto>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes })
    });
  }
}
