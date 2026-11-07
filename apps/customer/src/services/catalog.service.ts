import { ApiClient } from './api.client';
import { ApiResponse, ProductDto, SystemSettingsDto } from '@libreriard/shared';

export class CatalogService {
  private readonly client = ApiClient.getInstance();

  public async getProducts(params?: Record<string, string | number>): Promise<ApiResponse<ProductDto[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return this.client.request<ProductDto[]>(`/products${query}`);
  }

  public async getProductById(id: string): Promise<ApiResponse<ProductDto>> {
    return this.client.request<ProductDto>(`/products/${id}`);
  }

  public async getSettings(): Promise<ApiResponse<SystemSettingsDto>> {
    return this.client.request<SystemSettingsDto>('/settings');
  }

  public async getBankDetails(): Promise<ApiResponse<SystemSettingsDto>> {
    return this.getSettings();
  }
}

