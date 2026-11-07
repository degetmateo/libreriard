import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { BankTransferDetailsDto } from '@libreriard/shared';

export interface SystemSettingsProps {
  id?: UUIDv7;
  bankTransferDetails: BankTransferDetailsDto;
  updatedAt?: Date;
  updatedBy?: UUIDv7;
}

export class SystemSettings {
  private readonly _id: UUIDv7;
  private _bankTransferDetails: BankTransferDetailsDto;
  private _updatedAt: Date;
  private _updatedBy?: UUIDv7;

  constructor(p: SystemSettingsProps) {
    this._id = p.id || UUIDv7.generate();
    this._bankTransferDetails = p.bankTransferDetails;
    this._updatedAt = p.updatedAt || new Date();
    this._updatedBy = p.updatedBy;
  }

  public get id(): UUIDv7 { return this._id; }
  public get bankTransferDetails(): BankTransferDetailsDto { return this._bankTransferDetails; }
  public get updatedAt(): Date { return this._updatedAt; }
  public get updatedBy(): UUIDv7 | undefined { return this._updatedBy; }

  public updateBankDetails(details: BankTransferDetailsDto, adminId: UUIDv7): void {
    this._bankTransferDetails = details;
    this._updatedBy = adminId;
    this._updatedAt = new Date();
  }
}
