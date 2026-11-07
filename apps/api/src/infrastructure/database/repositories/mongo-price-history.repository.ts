import { IPriceHistoryRepository } from '../../../domain/repositories/price-history.repository.interface';
import { PriceHistory } from '../../../domain/entities/price-history.entity';
import { PriceHistoryMapper } from '../mappers/price-history.mapper';
import { MongoClient } from '../mongo-client';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.vo';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { Collection, Document } from 'mongodb';

export class MongoPriceHistoryRepository implements IPriceHistoryRepository {
  private get collection(): Collection<Document> {
    return MongoClient.getInstance().getCollection('price_history');
  }

  public async save(entry: PriceHistory): Promise<void> {
    const doc = PriceHistoryMapper.toPersistence(entry);
    await this.collection.insertOne(doc);
  }

  public async saveMany(entries: PriceHistory[]): Promise<void> {
    if (entries.length === 0) return;
    const docs = entries.map((e) => PriceHistoryMapper.toPersistence(e));
    await this.collection.insertMany(docs);
  }

  public async findByProductId(productId: UUIDv7, page = 1, limit = 20): Promise<{ items: PriceHistory[]; total: number }> {
    const query = { productId: BsonUuidHelper.toBsonUuid(productId) };
    const total = await this.collection.countDocuments(query);
    const docs = await this.collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return {
      items: docs.map((d) => PriceHistoryMapper.toDomain(d)),
      total
    };
  }

  public async findAll(page = 1, limit = 20): Promise<{ items: PriceHistory[]; total: number }> {
    const total = await this.collection.countDocuments({});
    const docs = await this.collection
      .find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    return {
      items: docs.map((d) => PriceHistoryMapper.toDomain(d)),
      total
    };
  }
}

