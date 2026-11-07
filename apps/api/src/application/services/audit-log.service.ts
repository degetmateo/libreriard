import { IAuditLogRepository } from '../../domain/repositories/audit-log.repository.interface';
import { AuditLogFactory } from '../../domain/factories/audit-log.factory';
import { AuditLogMapper } from '../../infrastructure/database/mappers/audit-log.mapper';
import { AuditActorDto, AuditEntityDto, AuditChangesDto, AuditLogTag, AuditLogQueryDto, AuditLogDto } from '@libreriard/shared';

export class AuditLogService {
  constructor(private readonly auditLogRepo: IAuditLogRepository) {}

  public async logAction(
    actor: AuditActorDto,
    action: string,
    entity: AuditEntityDto,
    changes: AuditChangesDto,
    tags: AuditLogTag[]
  ): Promise<void> {
    try {
      const log = AuditLogFactory.create({ actor, action, entity, changes, tags });
      await this.auditLogRepo.save(log);
    } catch (err) {
      console.error('Error al registrar log de auditoría:', err);
    }
  }

  public async getLogs(query: AuditLogQueryDto): Promise<{ items: AuditLogDto[]; total: number }> {
    const result = await this.auditLogRepo.findMany(query);
    return {
      items: result.items.map(log => AuditLogMapper.toDto(log)),
      total: result.total
    };
  }
}

