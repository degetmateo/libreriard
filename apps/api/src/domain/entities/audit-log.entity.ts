import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { AuditLogTag, AuditActorDto, AuditEntityDto, AuditChangesDto } from '@libreriard/shared';

export interface AuditLogProps {
  id?: UUIDv7;
  actor: AuditActorDto;
  action: string;
  entity: AuditEntityDto;
  changes: AuditChangesDto;
  tags: AuditLogTag[];
  timestamp?: Date;
}

export class AuditLog {
  private readonly _id: UUIDv7;
  private readonly _actor: AuditActorDto;
  private readonly _action: string;
  private readonly _entity: AuditEntityDto;
  private readonly _changes: AuditChangesDto;
  private readonly _tags: AuditLogTag[];
  private readonly _timestamp: Date;

  constructor(p: AuditLogProps) {
    this._id = p.id || UUIDv7.generate();
    this._actor = p.actor;
    this._action = p.action;
    this._entity = p.entity;
    this._changes = p.changes;
    this._tags = p.tags;
    this._timestamp = p.timestamp || new Date();
  }

  public get id(): UUIDv7 { return this._id; }
  public get actor(): AuditActorDto { return this._actor; }
  public get action(): string { return this._action; }
  public get entity(): AuditEntityDto { return this._entity; }
  public get changes(): AuditChangesDto { return this._changes; }
  public get tags(): AuditLogTag[] { return this._tags; }
  public get timestamp(): Date { return this._timestamp; }
}

