import { ApiClient } from './api.client';
import { ApiResponse, SystemSettingsDto, BankTransferDetailsDto } from '@libreriard/shared';

export class SettingsService {
  private readonly client = ApiClient.getInstance();

  public async getSettings(): Promise<ApiResponse<SystemSettingsDto>> {
    return this.client.request<SystemSettingsDto>('/settings');
  }

  public async updateBankDetails(bankTransferDetails: BankTransferDetailsDto): Promise<ApiResponse<SystemSettingsDto>> {
    return this.client.request<SystemSettingsDto>('/settings/bank-details', {
      method: 'PUT',
      body: JSON.stringify({ bankTransferDetails })
    });
  }
}
