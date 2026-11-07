import { SystemSettings } from '../entities/system-settings.entity';

export interface ISystemSettingsRepository {
  getSettings(): Promise<SystemSettings>;
  save(settings: SystemSettings): Promise<void>;
}

