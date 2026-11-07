import { ISystemSettingsRepository } from '../../domain/repositories/system-settings.repository.interface';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.vo';
import { SystemSettingsMapper } from '../../infrastructure/database/mappers/system-settings.mapper';
import { SystemSettingsDto, BankTransferDetailsDto, FooterContactDto } from '@libreriard/shared';

export class SystemSettingsService {
  constructor(private readonly settingsRepo: ISystemSettingsRepository) {}

  public async getSettings(): Promise<SystemSettingsDto> {
    const settings = await this.settingsRepo.getSettings();
    return SystemSettingsMapper.toDto(settings);
  }

  public async updateBankDetails(details: BankTransferDetailsDto, adminIdStr: string): Promise<SystemSettingsDto> {
    const settings = await this.settingsRepo.getSettings();
    const adminId = UUIDv7.fromString(adminIdStr);
    settings.updateBankDetails(details, adminId);
    await this.settingsRepo.save(settings);
    return SystemSettingsMapper.toDto(settings);
  }

  public async updateLegalTexts(terms: string, privacy: string, adminIdStr: string): Promise<SystemSettingsDto> {
    const settings = await this.settingsRepo.getSettings();
    const adminId = UUIDv7.fromString(adminIdStr);
    settings.updateLegalTexts(terms, privacy, adminId);
    await this.settingsRepo.save(settings);
    return SystemSettingsMapper.toDto(settings);
  }

  public async updateFooterContact(contact: FooterContactDto, adminIdStr: string): Promise<SystemSettingsDto> {
    const settings = await this.settingsRepo.getSettings();
    const adminId = UUIDv7.fromString(adminIdStr);
    settings.updateFooterContact(contact, adminId);
    await this.settingsRepo.save(settings);
    return SystemSettingsMapper.toDto(settings);
  }

  public async addCategory(category: string): Promise<SystemSettingsDto> {
    const settings = await this.settingsRepo.getSettings();
    settings.addCategory(category);
    await this.settingsRepo.save(settings);
    return SystemSettingsMapper.toDto(settings);
  }

  public async addTag(tag: string): Promise<SystemSettingsDto> {
    const settings = await this.settingsRepo.getSettings();
    settings.addTag(tag);
    await this.settingsRepo.save(settings);
    return SystemSettingsMapper.toDto(settings);
  }
}
