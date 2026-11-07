import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { BankTransferDetailsDto, FooterContactDto, CatalogMetadataDto } from '@libreriard/shared';

export interface SystemSettingsProps {
  id?: UUIDv7;
  bankTransferDetails: BankTransferDetailsDto;
  termsAndConditions: string;
  privacyPolicy: string;
  footerContact: FooterContactDto;
  catalogMetadata: CatalogMetadataDto;
  updatedAt?: Date;
  updatedBy?: UUIDv7;
}

export class SystemSettings {
  private readonly _id: UUIDv7;
  private _bankTransferDetails: BankTransferDetailsDto;
  private _termsAndConditions: string;
  private _privacyPolicy: string;
  private _footerContact: FooterContactDto;
  private _catalogMetadata: CatalogMetadataDto;
  private _updatedAt: Date;
  private _updatedBy?: UUIDv7;

  constructor(p: SystemSettingsProps) {
    this._id = p.id || UUIDv7.generate();
    this._bankTransferDetails = p.bankTransferDetails;
    this._termsAndConditions = p.termsAndConditions;
    this._privacyPolicy = p.privacyPolicy;
    this._footerContact = p.footerContact;
    this._catalogMetadata = p.catalogMetadata;
    this._updatedAt = p.updatedAt || new Date();
    this._updatedBy = p.updatedBy;
  }

  public get id(): UUIDv7 { return this._id; }
  public get bankTransferDetails(): BankTransferDetailsDto { return this._bankTransferDetails; }
  public get termsAndConditions(): string { return this._termsAndConditions; }
  public get privacyPolicy(): string { return this._privacyPolicy; }
  public get footerContact(): FooterContactDto { return this._footerContact; }
  public get catalogMetadata(): CatalogMetadataDto { return this._catalogMetadata; }
  public get updatedAt(): Date { return this._updatedAt; }
  public get updatedBy(): UUIDv7 | undefined { return this._updatedBy; }

  public updateBankDetails(details: BankTransferDetailsDto, adminId: UUIDv7): void {
    this._bankTransferDetails = details;
    this._updatedBy = adminId;
    this._updatedAt = new Date();
  }

  public updateLegalTexts(terms: string, privacy: string, adminId: UUIDv7): void {
    this._termsAndConditions = terms;
    this._privacyPolicy = privacy;
    this._updatedBy = adminId;
    this._updatedAt = new Date();
  }

  public updateFooterContact(contact: FooterContactDto, adminId: UUIDv7): void {
    this._footerContact = contact;
    this._updatedBy = adminId;
    this._updatedAt = new Date();
  }

  public addCategory(cat: string): void {
    const trimmed = cat.trim();
    if (trimmed && !this._catalogMetadata.categories.includes(trimmed)) {
      this._catalogMetadata.categories.push(trimmed);
      this._updatedAt = new Date();
    }
  }

  public addTag(tag: string): void {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !this._catalogMetadata.tags.includes(trimmed)) {
      this._catalogMetadata.tags.push(trimmed);
      this._updatedAt = new Date();
    }
  }
}
