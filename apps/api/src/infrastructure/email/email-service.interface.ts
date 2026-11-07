import { OrderDto, BankTransferDetailsDto } from '@libreriard/shared';

export interface IEmailService {
  sendActivationEmail(email: string, name: string, token: string): Promise<void>;
  sendPasswordResetEmail(email: string, name: string, token: string): Promise<void>;
  sendOrderConfirmationEmail(order: OrderDto, bankDetails?: BankTransferDetailsDto): Promise<void>;
  sendWholesaleRequestNotification(customerName: string, customerEmail: string, cuitCuil: string, message?: string): Promise<void>;
}

