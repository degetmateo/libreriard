import { ApiClient } from './api.client';
import { ApiResponse, ProductDto, CreateProductDto, UpdateProductDto } from '@libreriard/shared';

export class ProductService {
  private readonly client = ApiClient.getInstance();

  public async getProducts(params?: Record<string, string | number>): Promise<ApiResponse<ProductDto[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return this.client.request<ProductDto[]>(`/products${query}`);
  }

  public async getProductById(id: string): Promise<ApiResponse<ProductDto>> {
    return this.client.request<ProductDto>(`/products/${id}`);
  }

  public async createProduct(dto: CreateProductDto): Promise<ApiResponse<ProductDto>> {
    return this.client.request<ProductDto>('/products', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  public async updateProduct(id: string, dto: UpdateProductDto): Promise<ApiResponse<ProductDto>> {
    return this.client.request<ProductDto>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto)
    });
  }

  public async toggleActive(id: string): Promise<ApiResponse<ProductDto>> {
    return this.client.request<ProductDto>(`/products/${id}/toggle-active`, {
      method: 'PATCH'
    });
  }

  public async deleteProduct(id: string): Promise<ApiResponse<void>> {
    return this.client.request<void>(`/products/${id}`, { method: 'DELETE' });
  }

  public async uploadImage(file: File): Promise<ApiResponse<{ url: string; publicId: string }>> {
    const formData = new FormData();
    formData.append('image', file);
    return this.client.request<{ url: string; publicId: string }>('/upload/image', {
      method: 'POST',
      body: formData
    });
  }

  public async deleteImage(publicId: string): Promise<ApiResponse<void>> {
    return this.client.request<void>(`/upload/image/${encodeURIComponent(publicId)}`, {
      method: 'DELETE'
    });
  }
}
