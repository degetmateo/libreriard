import { StaffUser } from '../entities/staff-user.entity';
import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { Email } from '../value-objects/email.vo';

export interface IStaffUserRepository {
  findById(id: UUIDv7): Promise<StaffUser | null>;
  findByEmail(email: Email): Promise<StaffUser | null>;
  findAll(): Promise<StaffUser[]>;
  count(): Promise<number>;
  save(user: StaffUser): Promise<void>;
  delete(id: UUIDv7): Promise<void>;
}
