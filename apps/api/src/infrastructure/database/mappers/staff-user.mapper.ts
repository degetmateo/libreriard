import { StaffUser } from '../../../domain/entities/staff-user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { StaffUserDto, UserType, StaffRole } from '@libreriard/shared';
import { Document } from 'mongodb';

export class StaffUserMapper {
  public static toDomain(doc: Document): StaffUser {
    return new StaffUser({
      id: BsonUuidHelper.fromBsonUuid(doc._id),
      name: doc.name,
      email: Email.create(doc.email),
      passwordHash: doc.passwordHash,
      role: doc.role as StaffRole,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  public static toPersistence(entity: StaffUser): Document {
    return {
      _id: BsonUuidHelper.toBsonUuid(entity.id),
      name: entity.name,
      email: entity.email.toValue(),
      passwordHash: entity.passwordHash,
      role: entity.role,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  public static toDto(entity: StaffUser): StaffUserDto {
    return {
      id: entity.id.toString(),
      userType: UserType.STAFF,
      name: entity.name,
      email: entity.email.toValue(),
      role: entity.role,
      isActive: entity.isActive,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString()
    };
  }
}
