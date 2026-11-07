import { IStaffUserRepository } from '../../../domain/repositories/staff-user.repository.interface';
import { StaffUser } from '../../../domain/entities/staff-user.entity';
import { UUIDv7 } from '../../../domain/value-objects/uuid-v7.vo';
import { Email } from '../../../domain/value-objects/email.vo';
import { MongoClient } from '../mongo-client';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { StaffUserMapper } from '../mappers/staff-user.mapper';

export class MongoStaffUserRepository implements IStaffUserRepository {
  private get collection() {
    return MongoClient.getInstance().getCollection('staff_users');
  }

  public async findById(id: UUIDv7): Promise<StaffUser | null> {
    const doc = await this.collection.findOne({ _id: BsonUuidHelper.toBsonUuid(id) });
    return doc ? StaffUserMapper.toDomain(doc) : null;
  }

  public async findByEmail(email: Email): Promise<StaffUser | null> {
    const doc = await this.collection.findOne({ email: email.toValue() });
    return doc ? StaffUserMapper.toDomain(doc) : null;
  }

  public async findAll(): Promise<StaffUser[]> {
    const docs = await this.collection.find({}).sort({ createdAt: -1 }).toArray();
    return docs.map(doc => StaffUserMapper.toDomain(doc));
  }

  public async count(): Promise<number> {
    return this.collection.countDocuments();
  }

  public async save(user: StaffUser): Promise<void> {
    const doc = StaffUserMapper.toPersistence(user);
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
