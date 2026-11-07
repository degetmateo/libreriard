export interface BankTransferDetailsDto {
  bankName: string;
  accountHolder: string;
  cuitCuil: string;
  cbu: string;
  alias: string;
  accountType: string;
  notes: string;
}

export interface SystemSettingsDto {
  bankTransferDetails: BankTransferDetailsDto;
  updatedAt: string;
  updatedBy?: string;
}

export interface UpdateBankDetailsDto {
  bankTransferDetails: BankTransferDetailsDto;
}
