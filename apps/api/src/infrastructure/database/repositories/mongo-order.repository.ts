import { IOrderRepository, OrderFilterParams } from '../../../domain/repositories/order.repository.interface';
import { Order } from '../../../domain/entities/order.entity';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.vo';
import { OrderNumber } from '../../../domain/value-objects/order-number.vo';
import { MongoClient } from '../mongo-client';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { OrderMapper } from '../mappers/order.mapper';
import { Filter, Document } from 'mongodb';

export class MongoOrderRepository implements IOrderRepository {
  private get collection() {
    return MongoClient.getInstance().getCollection('orders');
  }

  public async findById(id: UUIDv7): Promise<Order | null> {
    const doc = await this.collection.findOne({ _id: BsonUuidHelper.toBsonUuid(id) });
    return doc ? OrderMapper.toDomain(doc) : null;
  }

  public async findByOrderNumber(orderNumber: OrderNumber): Promise<Order | null> {
    const doc = await this.collection.findOne({ orderNumber: orderNumber.toValue() });
    return doc ? OrderMapper.toDomain(doc) : null;
  }

  public async findMany(params: OrderFilterParams): Promise<{ items: Order[]; total: number }> {
    const filter: Filter<Document> = {};
    if (params.customerId) {
      filter.customerId = BsonUuidHelper.toBsonUuid(params.customerId);
    }
    if (params.status) {
      filter.status = params.status;
    }
    if (params.orderType) {
      filter.orderType = params.orderType;
    }
    if (params.search) {
      filter.$or = [
        { orderNumber: { $regex: params.search, $options: 'i' } },
        { 'customerSnapshot.name': { $regex: params.search, $options: 'i' } },
        { 'customerSnapshot.email': { $regex: params.search, $options: 'i' } }
      ];
    }

    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      this.collection.countDocuments(filter)
    ]);

    return {
      items: docs.map(doc => OrderMapper.toDomain(doc)),
      total
    };
  }

  public async save(order: Order): Promise<void> {
    const doc = OrderMapper.toPersistence(order);
    await this.collection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true }
    );
  }
}

