import { IProductRepository, ProductFilterParams } from '../../../domain/repositories/product.repository.interface';
import { Product } from '../../../domain/entities/product.entity';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.vo';
import { MongoClient } from '../mongo-client';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { ProductMapper } from '../mappers/product.mapper';
import { Filter, Document } from 'mongodb';

export class MongoProductRepository implements IProductRepository {
  private get collection() {
    return MongoClient.getInstance().getCollection('products');
  }

  public async findById(id: UUIDv7): Promise<Product | null> {
    const doc = await this.collection.findOne({ _id: BsonUuidHelper.toBsonUuid(id) });
    return doc ? ProductMapper.toDomain(doc) : null;
  }

  public async findByBarcode(barcode: string): Promise<Product | null> {
    const doc = await this.collection.findOne({ barcode });
    return doc ? ProductMapper.toDomain(doc) : null;
  }

  public async findMany(params: ProductFilterParams): Promise<{ items: Product[]; total: number }> {
    const filter: Filter<Document> = {};
    if (params.isActive !== undefined) {
      filter.isActive = params.isActive;
    }
    if (params.category) {
      filter.categories = params.category;
    }
    if (params.tag) {
      filter.tags = params.tag;
    }
    if (params.barcode) {
      filter.barcode = params.barcode;
    }
    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { description: { $regex: params.search, $options: 'i' } },
        { barcode: { $regex: params.search, $options: 'i' } },
        { tags: { $in: [new RegExp(params.search, 'i')] } }
      ];
    }

    const page = params.page || 1;
    const limit = params.limit || 24;
    const skip = (page - 1) * limit;

    const [docs, total] = await Promise.all([
      this.collection.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).toArray(),
      this.collection.countDocuments(filter)
    ]);

    return {
      items: docs.map(doc => ProductMapper.toDomain(doc)),
      total
    };
  }

  public async save(product: Product): Promise<void> {
    const doc = ProductMapper.toPersistence(product);
    await this.collection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true }
    );
  }

  public async delete(id: UUIDv7): Promise<void> {
    await this.collection.deleteOne({ _id: BsonUuidHelper.toBsonUuid(id) });
  }
}

