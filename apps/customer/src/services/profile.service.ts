import { ApiClient } from './api.client';
import { ApiResponse } from '@libreriard/shared';

export class ProfileService {
  private readonly client = ApiClient.getInstance();

  public async requestWholesale(message?: string): Promise<ApiResponse<void>> {
    return this.client.request<void>('/customers/wholesale-request', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  }
}

