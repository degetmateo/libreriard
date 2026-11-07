import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { Email } from '../value-objects/email.vo';
import { StaffRole } from '@libreriard/shared';

export interface StaffUserProps {
  id?: UUIDv7;
  name: string;
  email: Email;
  passwordHash: string;
  role: StaffRole;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class StaffUser {
  private readonly _id: UUIDv7;
  private _name: string;
  private _email: Email;
  private _passwordHash: string;
  private _role: StaffRole;
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(props: StaffUserProps) {
    this._id = props.id || UUIDv7.generate();
    this._name = props.name;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._role = props.role;
    this._isActive = props.isActive !== undefined ? props.isActive : true;
    this._createdAt = props.createdAt || new Date();
    this._updatedAt = props.updatedAt || new Date();
  }

  public get id(): UUIDv7 { return this._id; }
  public get name(): string { return this._name; }
  public get email(): Email { return this._email; }
  public get passwordHash(): string { return this._passwordHash; }
  public get role(): StaffRole { return this._role; }
  public get isActive(): boolean { return this._isActive; }
  public get createdAt(): Date { return this._createdAt; }
  public get updatedAt(): Date { return this._updatedAt; }

  public isAdmin(): boolean {
    return this._role === StaffRole.ADMIN;
  }

  public updateProfile(name?: string, role?: StaffRole, isActive?: boolean): void {
    if (name) this._name = name;
    if (role) this._role = role;
    if (isActive !== undefined) this._isActive = isActive;
    this._updatedAt = new Date();
  }

  public updatePassword(newPasswordHash: string): void {
    this._passwordHash = newPasswordHash;
    this._updatedAt = new Date();
  }
}

