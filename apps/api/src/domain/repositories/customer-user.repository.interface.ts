import { CustomerUser } from '../entities/customer-user.entity';
import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { Email } from '../value-objects/email.vo';

export interface CustomerFilterParams {
  search?: string;
  wholesalePendingOnly?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface ICustomerUserRepository {
  findById(id: UUIDv7): Promise<CustomerUser | null>;
  findByEmail(email: Email): Promise<CustomerUser | null>;
  findByCuitCuil(cuitCuil: string): Promise<CustomerUser | null>;
  findByVerificationToken(token: string): Promise<CustomerUser | null>;
  findByResetToken(token: string): Promise<CustomerUser | null>;
  findMany(params: CustomerFilterParams): Promise<{ items: CustomerUser[]; total: number }>;
  save(customer: CustomerUser): Promise<void>;
}

