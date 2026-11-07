import { ApiClient } from './api.client';
import { ApiResponse, AuditLogDto } from '@libreriard/shared';

export class AuditLogService {
  private readonly client = ApiClient.getInstance();

  public async getLogs(params?: Record<string, string | number>): Promise<ApiResponse<AuditLogDto[]>> {
    const query = params ? `?${new URLSearchParams(params as Record<string, string>).toString()}` : '';
    return this.client.request<AuditLogDto[]>(`/audit-logs${query}`);
  }
}
