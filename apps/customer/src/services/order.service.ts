import { ApiClient } from './api.client';
import { ApiResponse, OrderDto, CreateOrderDto } from '@libreriard/shared';

export class OrderService {
  private readonly client = ApiClient.getInstance();

  public async createOrder(dto: CreateOrderDto): Promise<ApiResponse<OrderDto>> {
    return this.client.request<OrderDto>('/orders', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  public async getMyOrders(): Promise<ApiResponse<OrderDto[]>> {
    return this.client.request<OrderDto[]>('/orders');
  }

  public async uploadReceipt(file: File): Promise<ApiResponse<{ url: string; publicId: string }>> {
    const formData = new FormData();
    formData.append('receipt', file);
    return this.client.request<{ url: string; publicId: string }>('/upload/receipt', {
      method: 'POST',
      body: formData
    });
  }
}
