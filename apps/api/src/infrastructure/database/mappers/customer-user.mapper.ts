import { CustomerUser } from '../../../domain/entities/customer-user.entity';
import { Email } from '../../../domain/value-objects/email.vo';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { CustomerUserDto, UserType, CustomerWholesaleStatus } from '@libreriard/shared';
import { Document } from 'mongodb';

export class CustomerUserMapper {
  public static toDomain(doc: Document): CustomerUser {
    return new CustomerUser({
      id: BsonUuidHelper.fromBsonUuid(doc._id),
      name: doc.name,
      cuitCuil: doc.cuitCuil,
      email: Email.create(doc.email),
      passwordHash: doc.passwordHash,
      phone: doc.phone,
      address: doc.address,
      postalCode: doc.postalCode,
      isWholesaleApproved: doc.isWholesaleApproved,
      wholesaleStatus: doc.wholesaleStatus as CustomerWholesaleStatus,
      wholesaleMessage: doc.wholesaleMessage,
      isEmailVerified: doc.isEmailVerified,
      isActive: doc.isActive !== undefined ? doc.isActive : true,
      verificationToken: doc.verificationToken,
      verificationExpires: doc.verificationExpires,
      resetToken: doc.resetToken,
      resetExpires: doc.resetExpires,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  public static toPersistence(entity: CustomerUser): Document {
    return {
      _id: BsonUuidHelper.toBsonUuid(entity.id),
      name: entity.name,
      cuitCuil: entity.cuitCuil,
      email: entity.email.toValue(),
      passwordHash: entity.passwordHash,
      phone: entity.phone,
      address: entity.address,
      postalCode: entity.postalCode,
      isWholesaleApproved: entity.isWholesaleApproved,
      wholesaleStatus: entity.wholesaleStatus,
      wholesaleMessage: entity.wholesaleMessage,
      isEmailVerified: entity.isEmailVerified,
      isActive: entity.isActive,
      verificationToken: entity.verificationToken,
      verificationExpires: entity.verificationExpires,
      resetToken: entity.resetToken,
      resetExpires: entity.resetExpires,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  public static toDto(entity: CustomerUser): CustomerUserDto {
    return {
      id: entity.id.toString(),
      userType: UserType.CUSTOMER,
      name: entity.name,
      cuitCuil: entity.cuitCuil,
      email: entity.email.toValue(),
      phone: entity.phone,
      address: entity.address,
      postalCode: entity.postalCode,
      isWholesaleApproved: entity.isWholesaleApproved,
      wholesaleStatus: entity.wholesaleStatus,
      wholesaleMessage: entity.wholesaleMessage,
      isEmailVerified: entity.isEmailVerified,
      isActive: entity.isActive,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString()
    };
  }
}
