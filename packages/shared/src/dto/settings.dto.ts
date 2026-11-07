export interface BankTransferDetailsDto {
  bankName: string;
  accountHolder: string;
  cuitCuil: string;
  cbu: string;
  alias: string;
  accountType: string;
  notes: string;
}

export interface FooterContactDto {
  address: string;
  googleMapsUrl: string;
  schedule: string;
  email: string;
  phone: string;
}

export interface CatalogMetadataDto {
  categories: string[];
  tags: string[];
}

export interface SystemSettingsDto {
  bankTransferDetails: BankTransferDetailsDto;
  termsAndConditions: string;
  privacyPolicy: string;
  footerContact: FooterContactDto;
  catalogMetadata: CatalogMetadataDto;
  updatedAt: string;
  updatedBy?: string;
}

export interface UpdateBankDetailsDto {
  bankTransferDetails: BankTransferDetailsDto;
}

export interface UpdateLegalTextsDto {
  termsAndConditions: string;
  privacyPolicy: string;
}

export interface UpdateFooterContactDto {
  footerContact: FooterContactDto;
}
