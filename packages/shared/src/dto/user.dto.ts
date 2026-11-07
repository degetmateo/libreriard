import { StaffRole, CustomerWholesaleStatus, UserType } from '../enums';

export interface StaffUserDto {
  id: string;
  userType: UserType.STAFF;
  name: string;
  email: string;
  role: StaffRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerUserDto {
  id: string;
  userType: UserType.CUSTOMER;
  name: string;
  cuitCuil: string;
  email: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  isWholesaleApproved: boolean;
  wholesaleStatus: CustomerWholesaleStatus;
  wholesaleMessage?: string;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStaffDto {
  name: string;
  email: string;
  password: string;
  role: StaffRole;
}

export interface UpdateStaffDto {
  name?: string;
  email?: string;
  role?: StaffRole;
  isActive?: boolean;
}

export interface ResetStaffPasswordDto {
  newPassword: string;
}

export interface WholesaleRequestSubmissionDto {
  message?: string;
}

export interface ReviewWholesaleRequestDto {
  approved: boolean;
}
