import { ApiClient } from './api.client';
import { ApiResponse, StaffUserDto, CreateStaffDto, UpdateStaffDto } from '@libreriard/shared';

export class StaffService {
  private readonly client = ApiClient.getInstance();

  public async getStaffList(): Promise<ApiResponse<StaffUserDto[]>> {
    return this.client.request<StaffUserDto[]>('/staff');
  }

  public async createStaff(dto: CreateStaffDto): Promise<ApiResponse<StaffUserDto>> {
    return this.client.request<StaffUserDto>('/staff', {
      method: 'POST',
      body: JSON.stringify(dto)
    });
  }

  public async updateStaff(id: string, dto: UpdateStaffDto): Promise<ApiResponse<StaffUserDto>> {
    return this.client.request<StaffUserDto>(`/staff/${id}`, {
      method: 'PUT',
      body: JSON.stringify(dto)
    });
  }

  public async resetPassword(id: string, newPassword: string): Promise<ApiResponse<void>> {
    return this.client.request<void>(`/staff/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify({ newPassword })
    });
  }

  public async deleteStaff(id: string): Promise<ApiResponse<void>> {
    return this.client.request<void>(`/staff/${id}`, { method: 'DELETE' });
  }
}

