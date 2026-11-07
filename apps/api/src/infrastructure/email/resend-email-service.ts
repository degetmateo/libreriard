import { Resend } from 'resend';
import { IEmailService } from './email-service.interface';
import { EnvConfig } from '../config/env.config';
import { OrderDto, BankTransferDetailsDto } from '@libreriard/shared';

export class ResendEmailService implements IEmailService {
  private resend: Resend | null = null;

  constructor() {
    if (EnvConfig.RESEND_API_KEY && !EnvConfig.RESEND_API_KEY.includes('placeholder')) {
      this.resend = new Resend(EnvConfig.RESEND_API_KEY);
    }
  }

  public async sendActivationEmail(email: string, name: string, token: string): Promise<void> {
    const activationUrl = `${EnvConfig.CLIENT_URL}/activate-account?token=${token}`;
    const html = `<h2>¡Bienvenido a Librería Rubén Darío, ${name}!</h2>
      <p>Por favor confirma tu dirección de correo electrónico haciendo clic en el siguiente enlace:</p>
      <p><a href="${activationUrl}" style="padding:10px 20px;background:#00D9FF;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;">Activar mi cuenta</a></p>
      <p>O copia el siguiente enlace en tu navegador: ${activationUrl}</p>`;

    await this.send(email, 'Activa tu cuenta en Librería Rubén Darío', html);
  }

  public async sendPasswordResetEmail(email: string, name: string, token: string): Promise<void> {
    const resetUrl = `${EnvConfig.CLIENT_URL}/reset-password?token=${token}`;
    const html = `<h2>Hola ${name},</h2>
      <p>Has solicitado restablecer tu contraseña en Librería Rubén Darío.</p>
      <p><a href="${resetUrl}" style="padding:10px 20px;background:#00D9FF;color:#000;text-decoration:none;border-radius:6px;font-weight:bold;">Restablecer contraseña</a></p>
      <p>Este enlace expirará en 1 hora. Si no solicitaste este cambio, puedes ignorar este mensaje.</p>`;

    await this.send(email, 'Recuperación de contraseña - Librería Rubén Darío', html);
  }

  public async sendOrderConfirmationEmail(order: OrderDto, bankDetails?: BankTransferDetailsDto): Promise<void> {
    let transferHtml = '';
    if (order.paymentMethod === 'TRANSFERENCIA' && bankDetails) {
      transferHtml = `<div style="background:#f1f5f9;padding:12px;border-radius:6px;margin-top:15px;">
        <h3>Datos para realizar la transferencia bancaria:</h3>
        <p><strong>Banco:</strong> ${bankDetails.bankName}</p>
        <p><strong>Titular:</strong> ${bankDetails.accountHolder} (CUIT: ${bankDetails.cuitCuil})</p>
        <p><strong>CBU:</strong> ${bankDetails.cbu}</p>
        <p><strong>Alias:</strong> ${bankDetails.alias}</p>
        <p><em>${bankDetails.notes}</em></p>
      </div>`;
    }

    const html = `<h2>¡Gracias por tu compra en Librería Rubén Darío!</h2>
      <p>Tu orden <strong>#${order.orderNumber}</strong> ha sido confirmada con éxito.</p>
      <p><strong>Total:</strong> $${order.total.toLocaleString('es-AR')}</p>
      <p><strong>Método de entrega:</strong> ${order.deliveryMethod === 'RETIRO_LOCAL' ? 'Retiro en el local' : 'Envío a domicilio'}</p>
      ${transferHtml}`;

    await this.send(order.customer.email, `Confirmación de Orden #${order.orderNumber} - Librería Rubén Darío`, html);
  }

  public async sendWholesaleRequestNotification(name: string, email: string, cuit: string, msg?: string): Promise<void> {
    const html = `<h2>Nueva solicitud de cliente mayorista</h2>
      <p><strong>Cliente:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>CUIT/CUIL:</strong> ${cuit}</p>
      <p><strong>Mensaje del cliente:</strong> ${msg || 'Sin mensaje adicional.'}</p>
      <p>Accede al panel de staff para revisar y aprobar la cuenta.</p>`;

    await this.send(EnvConfig.ADMIN_NOTIFICATION_EMAIL, `Solicitud Mayorista: ${name}`, html);
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (this.resend) {
      await this.resend.emails.send({ from: EnvConfig.EMAIL_FROM, to, subject, html });
    } else {
      console.log(`[Resend Mock Email] To: ${to} | Subject: "${subject}"`);
    }
  }
}

