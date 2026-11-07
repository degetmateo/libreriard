import { ApiClient } from './api.client';
import { ApiResponse, SystemSettingsDto, BankTransferDetailsDto, FooterContactDto } from '@libreriard/shared';

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

  public async updateLegalTexts(termsAndConditions: string, privacyPolicy: string): Promise<ApiResponse<SystemSettingsDto>> {
    return this.client.request<SystemSettingsDto>('/settings/legal', {
      method: 'PUT',
      body: JSON.stringify({ termsAndConditions, privacyPolicy })
    });
  }

  public async updateFooterContact(footerContact: FooterContactDto): Promise<ApiResponse<SystemSettingsDto>> {
    return this.client.request<SystemSettingsDto>('/settings/contact', {
      method: 'PUT',
      body: JSON.stringify({ footerContact })
    });
  }

  public async addCategory(item: string): Promise<ApiResponse<SystemSettingsDto>> {
    return this.client.request<SystemSettingsDto>('/settings/categories', {
      method: 'POST',
      body: JSON.stringify({ item })
    });
  }

  public async addTag(item: string): Promise<ApiResponse<SystemSettingsDto>> {
    return this.client.request<SystemSettingsDto>('/settings/tags', {
      method: 'POST',
      body: JSON.stringify({ item })
    });
  }
}
