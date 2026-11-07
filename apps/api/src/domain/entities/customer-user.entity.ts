import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { Email } from '../value-objects/email.vo';
import { CustomerWholesaleStatus } from '@libreriard/shared';

export interface CustomerUserProps {
  id?: UUIDv7;
  name: string;
  cuitCuil: string;
  email: Email;
  passwordHash: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  isWholesaleApproved?: boolean;
  wholesaleStatus?: CustomerWholesaleStatus;
  wholesaleMessage?: string;
  isEmailVerified?: boolean;
  verificationToken?: string;
  verificationExpires?: Date;
  resetToken?: string;
  resetExpires?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class CustomerUser {
  private readonly _id: UUIDv7;
  private _name: string;
  private _cuitCuil: string;
  private _email: Email;
  private _passwordHash: string;
  private _phone?: string;
  private _address?: string;
  private _postalCode?: string;
  private _isWholesaleApproved: boolean;
  private _wholesaleStatus: CustomerWholesaleStatus;
  private _wholesaleMessage?: string;
  private _isEmailVerified: boolean;
  private _verificationToken?: string;
  private _verificationExpires?: Date;
  private _resetToken?: string;
  private _resetExpires?: Date;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(p: CustomerUserProps) {
    this._id = p.id || UUIDv7.generate();
    this._name = p.name;
    this._cuitCuil = p.cuitCuil;
    this._email = p.email;
    this._passwordHash = p.passwordHash;
    this._phone = p.phone;
    this._address = p.address;
    this._postalCode = p.postalCode;
    this._isWholesaleApproved = p.isWholesaleApproved || false;
    this._wholesaleStatus = p.wholesaleStatus || CustomerWholesaleStatus.NONE;
    this._wholesaleMessage = p.wholesaleMessage;
    this._isEmailVerified = p.isEmailVerified || false;
    this._verificationToken = p.verificationToken;
    this._verificationExpires = p.verificationExpires;
    this._resetToken = p.resetToken;
    this._resetExpires = p.resetExpires;
    this._createdAt = p.createdAt || new Date();
    this._updatedAt = p.updatedAt || new Date();
  }

  public get id(): UUIDv7 { return this._id; }
  public get name(): string { return this._name; }
  public get cuitCuil(): string { return this._cuitCuil; }
  public get email(): Email { return this._email; }
  public get passwordHash(): string { return this._passwordHash; }
  public get phone(): string | undefined { return this._phone; }
  public get address(): string | undefined { return this._address; }
  public get postalCode(): string | undefined { return this._postalCode; }
  public get isWholesaleApproved(): boolean { return this._isWholesaleApproved; }
  public get wholesaleStatus(): CustomerWholesaleStatus { return this._wholesaleStatus; }
  public get wholesaleMessage(): string | undefined { return this._wholesaleMessage; }
  public get isEmailVerified(): boolean { return this._isEmailVerified; }
  public get verificationToken(): string | undefined { return this._verificationToken; }
  public get verificationExpires(): Date | undefined { return this._verificationExpires; }
  public get resetToken(): string | undefined { return this._resetToken; }
  public get resetExpires(): Date | undefined { return this._resetExpires; }
  public get createdAt(): Date { return this._createdAt; }
  public get updatedAt(): Date { return this._updatedAt; }

  public verifyEmail(): void {
    this._isEmailVerified = true;
    this._verificationToken = undefined;
    this._verificationExpires = undefined;
    this._updatedAt = new Date();
  }

  public requestWholesale(message?: string): void {
    this._wholesaleStatus = CustomerWholesaleStatus.PENDING;
    this._wholesaleMessage = message;
    this._updatedAt = new Date();
  }

  public reviewWholesale(approved: boolean): void {
    this._isWholesaleApproved = approved;
    this._wholesaleStatus = approved ? CustomerWholesaleStatus.APPROVED : CustomerWholesaleStatus.REJECTED;
    this._updatedAt = new Date();
  }

  public setResetToken(token: string, expires: Date): void {
    this._resetToken = token;
    this._resetExpires = expires;
    this._updatedAt = new Date();
  }

  public updatePassword(newPasswordHash: string): void {
    this._passwordHash = newPasswordHash;
    this._resetToken = undefined;
    this._resetExpires = undefined;
    this._updatedAt = new Date();
  }
}
