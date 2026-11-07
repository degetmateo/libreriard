import { AuditLogTag } from '../enums';

export interface AuditActorDto {
  id: string;
  name: string;
  email: string;
  role: string;
  ip?: string;
}

export interface AuditEntityDto {
  type: string;
  id: string;
}

export interface AuditChangesDto {
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
}

export interface AuditLogDto {
  id: string;
  actor: AuditActorDto;
  action: string;
  entity: AuditEntityDto;
  changes: AuditChangesDto;
  tags: AuditLogTag[];
  timestamp: string;
}

export interface AuditLogQueryDto {
  tag?: AuditLogTag;
  entityType?: string;
  actorId?: string;
  page?: number;
  limit?: number;
}

