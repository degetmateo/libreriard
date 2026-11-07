import { ApiClient } from './api.client';
import { ApiResponse, ProductDto, CreateProductDto, UpdateProductDto, PriceHistoryDto } from '@libreriard/shared';

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

  public async exportExcel(): Promise<Blob> {
    return this.client.downloadBlob('/products/export/excel');
  }

  public async importExcel(file: File): Promise<ApiResponse<{ total: number; created: number; updated: number; errors: string[] }>> {
    const formData = new FormData();
    formData.append('file', file);
    return this.client.request('/products/import/excel', {
      method: 'POST',
      body: formData
    });
  }

  public async importMassive(fileOrData: File | any[]): Promise<ApiResponse<{ total: number; inserted: number; updated: number; errors: string[] }>> {
    if (fileOrData instanceof File) {
      const formData = new FormData();
      formData.append('file', fileOrData);
      return this.client.request('/products/import/massive', {
        method: 'POST',
        body: formData
      });
    }
    return this.client.request('/products/import/massive', {
      method: 'POST',
      body: JSON.stringify({ products: fileOrData })
    });
  }

  public async getProductPriceHistory(productId: string, page = 1, limit = 20): Promise<ApiResponse<PriceHistoryDto[]>> {
    return this.client.request<PriceHistoryDto[]>(`/products/${productId}/price-history?page=${page}&limit=${limit}`);
  }

  public async getAllPriceHistory(page = 1, limit = 20): Promise<ApiResponse<PriceHistoryDto[]>> {
    return this.client.request<PriceHistoryDto[]>(`/products/price-history?page=${page}&limit=${limit}`);
  }
}
