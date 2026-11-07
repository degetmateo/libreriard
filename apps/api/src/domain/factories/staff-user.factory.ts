import { StaffUser } from '../entities/staff-user.entity';
import { Email } from '../value-objects/email.vo';
import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { StaffRole } from '@libreriard/shared';

export interface CreateStaffParams {
  name: string;
  email: string;
  passwordHash: string;
  role: StaffRole;
}

export class StaffUserFactory {
  public static create(params: CreateStaffParams): StaffUser {
    return new StaffUser({
      id: UUIDv7.generate(),
      name: params.name.trim(),
      email: Email.create(params.email),
      passwordHash: params.passwordHash,
      role: params.role,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}

