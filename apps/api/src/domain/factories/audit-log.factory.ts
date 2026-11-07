import { AuditLog } from '../entities/audit-log.entity';
import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { AuditLogTag, AuditActorDto, AuditEntityDto, AuditChangesDto } from '@libreriard/shared';

export interface CreateAuditLogParams {
  actor: AuditActorDto;
  action: string;
  entity: AuditEntityDto;
  changes: AuditChangesDto;
  tags: AuditLogTag[];
}

export class AuditLogFactory {
  public static create(p: CreateAuditLogParams): AuditLog {
    return new AuditLog({
      id: UUIDv7.generate(),
      actor: p.actor,
      action: p.action,
      entity: p.entity,
      changes: p.changes,
      tags: p.tags,
      timestamp: new Date()
    });
  }
}
