import { SystemSettings } from '../../../domain/entities/system-settings.entity';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { SystemSettingsDto } from '@libreriard/shared';
import { Document } from 'mongodb';

export class SystemSettingsMapper {
  public static toDomain(doc: Document): SystemSettings {
    return new SystemSettings({
      id: BsonUuidHelper.fromBsonUuid(doc._id),
      bankTransferDetails: doc.bankTransferDetails,
      updatedAt: doc.updatedAt,
      updatedBy: doc.updatedBy ? BsonUuidHelper.fromBsonUuid(doc.updatedBy) : undefined
    });
  }

  public static toPersistence(entity: SystemSettings): Document {
    return {
      _id: BsonUuidHelper.toBsonUuid(entity.id),
      bankTransferDetails: entity.bankTransferDetails,
      updatedAt: entity.updatedAt,
      updatedBy: entity.updatedBy ? BsonUuidHelper.toBsonUuid(entity.updatedBy) : null
    };
  }

  public static toDto(entity: SystemSettings): SystemSettingsDto {
    return {
      bankTransferDetails: entity.bankTransferDetails,
      updatedAt: entity.updatedAt.toISOString(),
      updatedBy: entity.updatedBy ? entity.updatedBy.toString() : undefined
    };
  }
}
