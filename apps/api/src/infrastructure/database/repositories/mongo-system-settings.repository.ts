import { ISystemSettingsRepository } from '../../../domain/repositories/system-settings.repository.interface';
import { SystemSettings } from '../../../domain/entities/system-settings.entity';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.vo';
import { MongoClient } from '../mongo-client';
import { SystemSettingsMapper } from '../mappers/system-settings.mapper';

export class MongoSystemSettingsRepository implements ISystemSettingsRepository {
  private get collection() {
    return MongoClient.getInstance().getCollection('system_settings');
  }

  public async getSettings(): Promise<SystemSettings> {
    const doc = await this.collection.findOne({});
    if (doc) {
      return SystemSettingsMapper.toDomain(doc);
    }

    const defaultSettings = new SystemSettings({
      id: UUIDv7.generate(),
      bankTransferDetails: {
        bankName: 'Banco Santander',
        accountHolder: 'Librería Rubén Darío S.R.L.',
        cuitCuil: '30-71234567-8',
        cbu: '0720123488000012345678',
        alias: 'LIBRERIA.RUBEN.DARIO',
        accountType: 'Cuenta Corriente Especial en Pesos',
        notes: 'Por favor envíe el comprobante de transferencia a transferencias@libreriard.com.ar indicando el número de orden.'
      },
      updatedAt: new Date()
    });

    await this.save(defaultSettings);
    return defaultSettings;
  }

  public async save(settings: SystemSettings): Promise<void> {
    const doc = SystemSettingsMapper.toPersistence(settings);
    await this.collection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true }
    );
  }
}
