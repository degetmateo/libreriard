import crypto from 'crypto';
import { CustomerUser } from '../entities/customer-user.entity';
import { Email } from '../value-objects/email.vo';
import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { CustomerWholesaleStatus } from '@libreriard/shared';

export interface CreateCustomerParams {
  name: string;
  cuitCuil: string;
  email: string;
  passwordHash: string;
  phone?: string;
  address?: string;
  postalCode?: string;
}

export class CustomerUserFactory {
  public static create(p: CreateCustomerParams): CustomerUser {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return new CustomerUser({
      id: UUIDv7.generate(),
      name: p.name.trim(),
      cuitCuil: p.cuitCuil.replace(/[^0-9]/g, ''),
      email: Email.create(p.email),
      passwordHash: p.passwordHash,
      phone: p.phone?.trim(),
      address: p.address?.trim(),
      postalCode: p.postalCode?.trim(),
      isWholesaleApproved: false,
      wholesaleStatus: CustomerWholesaleStatus.NONE,
      isEmailVerified: false,
      verificationToken,
      verificationExpires,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
