import { AuditLog } from '../../../domain/entities/audit-log.entity';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { AuditLogDto, AuditLogTag } from '@libreriard/shared';
import { Document } from 'mongodb';

export class AuditLogMapper {
  public static toDomain(doc: Document): AuditLog {
    return new AuditLog({
      id: BsonUuidHelper.fromBsonUuid(doc._id),
      actor: doc.actor,
      action: doc.action,
      entity: doc.entity,
      changes: doc.changes,
      tags: (doc.tags || []) as AuditLogTag[],
      timestamp: doc.timestamp
    });
  }

  public static toPersistence(entity: AuditLog): Document {
    return {
      _id: BsonUuidHelper.toBsonUuid(entity.id),
      actor: entity.actor,
      action: entity.action,
      entity: entity.entity,
      changes: entity.changes,
      tags: entity.tags,
      timestamp: entity.timestamp
    };
  }

  public static toDto(entity: AuditLog): AuditLogDto {
    return {
      id: entity.id.toString(),
      actor: entity.actor,
      action: entity.action,
      entity: entity.entity,
      changes: entity.changes,
      tags: entity.tags,
      timestamp: entity.timestamp.toISOString()
    };
  }
}

