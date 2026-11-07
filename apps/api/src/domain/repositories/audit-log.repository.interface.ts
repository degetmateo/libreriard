import { AuditLog } from '../entities/audit-log.entity';
import { AuditLogQueryDto } from '@libreriard/shared';

export interface IAuditLogRepository {
  findMany(params: AuditLogQueryDto): Promise<{ items: AuditLog[]; total: number }>;
  save(log: AuditLog): Promise<void>;
}

