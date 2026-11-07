import { ICustomerUserRepository, CustomerFilterParams } from '../../../domain/repositories/customer-user.repository.interface';
import { CustomerUser } from '../../../domain/entities/customer-user.entity';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.vo';
import { Email } from '../../../domain/value-objects/email.vo';
import { MongoClient } from '../mongo-client';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { CustomerUserMapper } from '../mappers/customer-user.mapper';
import { Filter, Document } from 'mongodb';

export class MongoCustomerUserRepository implements ICustomerUserRepository {
  private get collection() {
    return MongoClient.getInstance().getCollection('customer_users');
  }

  public async findById(id: UUIDv7): Promise<CustomerUser | null> {
    const doc = await this.collection.findOne({ _id: BsonUuidHelper.toBsonUuid(id) });
    return doc ? CustomerUserMapper.toDomain(doc) : null;
  }

  public async findByEmail(email: Email): Promise<CustomerUser | null> {
    const doc = await this.collection.findOne({ email: email.toValue() });
    return doc ? CustomerUserMapper.toDomain(doc) : null;
  }

  public async findByCuitCuil(cuitCuil: string): Promise<CustomerUser | null> {
    const doc = await this.collection.findOne({ cuitCuil: cuitCuil.replace(/[^0-9]/g, '') });
    return doc ? CustomerUserMapper.toDomain(doc) : null;
  }

  public async findByVerificationToken(token: string): Promise<CustomerUser | null> {
    const doc = await this.collection.findOne({ verificationToken: token });
    return doc ? CustomerUserMapper.toDomain(doc) : null;
  }

  public async findByResetToken(token: string): Promise<CustomerUser | null> {
    const doc = await this.collection.findOne({ resetToken: token });
    return doc ? CustomerUserMapper.toDomain(doc) : null;
  }

  public async findMany(params: CustomerFilterParams): Promise<{ items: CustomerUser[]; total: number }> {
    const filter: Filter<Document> = {};
    if (params.wholesalePendingOnly) {
      filter.wholesaleStatus = 'PENDING';
    }
    if (params.search) {
      filter.$or = [
        { name: { $regex: params.search, $options: 'i' } },
        { email: { $regex: params.search, $options: 'i' } },
        { cuitCuil: { $regex: params.search, $options: 'i' } }
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
      items: docs.map(doc => CustomerUserMapper.toDomain(doc)),
      total
    };
  }

  public async save(customer: CustomerUser): Promise<void> {
    const doc = CustomerUserMapper.toPersistence(customer);
    await this.collection.updateOne(
      { _id: doc._id },
      { $set: doc },
      { upsert: true }
    );
  }
}
