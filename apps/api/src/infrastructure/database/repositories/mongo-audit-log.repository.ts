import { IAuditLogRepository } from '../../../domain/repositories/audit-log.repository.interface';
import { AuditLog } from '../../../domain/entities/audit-log.entity';
import { AuditLogQueryDto } from '@libreriard/shared';
import { MongoClient } from '../mongo-client';
import { AuditLogMapper } from '../mappers/audit-log.mapper';
import { Filter, Document } from 'mongodb';

export class MongoAuditLogRepository implements IAuditLogRepository {
  private get collection() {
    return MongoClient.getInstance().getCollection('audit_logs');
  }

  public async findMany(params: AuditLogQueryDto): Promise<{ items: AuditLog[]; total: number }> {
    const filter: Filter<Document> = {};
    if (params.tag) {
      filter.tags = params.tag;
    }
    if (params.entityType) {
      filter['entity.type'] = params.entityType;
    }
    if (params.actorId) {
      filter['actor.id'] = params.actorId;
    }

    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.collection.find(filter).sort({ timestamp: -1 }).skip(skip).limit(limit).toArray(),
      this.collection.countDocuments(filter)
    ]);

    return {
      items: docs.map(doc => AuditLogMapper.toDomain(doc)),
      total
    };
  }

  public async save(log: AuditLog): Promise<void> {
    const doc = AuditLogMapper.toPersistence(log);
    await this.collection.insertOne(doc);
  }
}

