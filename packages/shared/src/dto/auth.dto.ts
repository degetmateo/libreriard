import { StaffUserDto, CustomerUserDto } from './user.dto';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface CustomerRegisterRequestDto {
  name: string;
  cuitCuil: string;
  email: string;
  password: string;
  acceptTerms: boolean;
  phone?: string;
  address?: string;
  postalCode?: string;
}

export interface PasswordResetRequestDto {
  email: string;
}

export interface PasswordResetConfirmDto {
  token: string;
  newPassword: string;
}

export interface AuthTokensDto {
  accessToken: string;
  user: StaffUserDto | CustomerUserDto;
}
