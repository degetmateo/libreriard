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

  public async getMyOrders(params?: Record<string, string | number>): Promise<ApiResponse<OrderDto[]>> {
    let query = '';
    if (params) {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== '') q.append(k, String(v));
      });
      const qs = q.toString();
      if (qs) query = `?${qs}`;
    }
    return this.client.request<OrderDto[]>(`/orders${query}`);
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
