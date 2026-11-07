import { ICustomerUserRepository } from '../../domain/repositories/customer-user.repository.interface';
import { IPasswordHasher } from '../../infrastructure/security/password-hasher.interface';
import { JwtTokenProvider } from '../../infrastructure/security/jwt-token-provider';
import { IEmailService } from '../../infrastructure/email/email-service.interface';
import { CustomerUserFactory } from '../../domain/factories/customer-user.factory';
import { Email } from '../../domain/value-objects/email.vo';
import { CustomerUserMapper } from '../../infrastructure/database/mappers/customer-user.mapper';
import { CustomerRegisterRequestDto, CustomerUserDto, UserType } from '@libreriard/shared';
import crypto from 'crypto';

export class AuthCustomerService {
  constructor(
    private readonly customerRepo: ICustomerUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenProvider: JwtTokenProvider,
    private readonly emailService: IEmailService
  ) {}

  public async register(dto: CustomerRegisterRequestDto): Promise<CustomerUserDto> {
    if (!dto.acceptTerms) {
      throw new Error('Debe aceptar los Términos y Condiciones y la Política de Privacidad.');
    }
    const email = Email.create(dto.email);
    const existing = await this.customerRepo.findByEmail(email);
    if (existing) throw new Error('Ya existe una cuenta registrada con este correo electrónico.');

    const cleanCuit = dto.cuitCuil.replace(/[^0-9]/g, '');
    const existingCuit = await this.customerRepo.findByCuitCuil(cleanCuit);
    if (existingCuit) throw new Error('Ya existe una cuenta con este número de CUIT/CUIL.');

    const passwordHash = await this.passwordHasher.hash(dto.password);
    const customer = CustomerUserFactory.create({ ...dto, passwordHash });
    await this.customerRepo.save(customer);

    if (customer.verificationToken) {
      await this.emailService.sendActivationEmail(customer.email.toValue(), customer.name, customer.verificationToken);
    }
    return CustomerUserMapper.toDto(customer);
  }

  public async activateAccount(token: string): Promise<void> {
    const customer = await this.customerRepo.findByVerificationToken(token);
    if (!customer) throw new Error('El token de activación es inválido o ha expirado.');
    customer.verifyEmail();
    await this.customerRepo.save(customer);
  }

  public async login(emailStr: string, pass: string): Promise<{ accessToken: string; refreshToken: string; user: CustomerUserDto }> {
    const email = Email.create(emailStr);
    const customer = await this.customerRepo.findByEmail(email);
    if (!customer) throw new Error('Credenciales inválidas.');

    const isMatch = await this.passwordHasher.compare(pass, customer.passwordHash);
    if (!isMatch) throw new Error('Credenciales inválidas.');

    if (!customer.isActive) {
      throw new Error('Tu cuenta se encuentra desactivada. Por favor contacta con administración.');
    }

    if (!customer.isEmailVerified) {
      throw new Error('Tu cuenta aún no ha sido activada. Por favor revisa tu correo y haz clic en el enlace de activación.');
    }

    const payload = {
      sub: customer.id.toString(),
      email: customer.email.toValue(),
      userType: UserType.CUSTOMER,
      isWholesaleApproved: customer.isWholesaleApproved
    };

    return {
      accessToken: this.tokenProvider.generateAccessToken(payload),
      refreshToken: this.tokenProvider.generateRefreshToken(payload),
      user: CustomerUserMapper.toDto(customer)
    };
  }

  public async requestPasswordReset(emailStr: string): Promise<void> {
    const email = Email.create(emailStr);
    const customer = await this.customerRepo.findByEmail(email);
    if (!customer) return;

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
    customer.setResetToken(resetToken, resetExpires);
    await this.customerRepo.save(customer);
    await this.emailService.sendPasswordResetEmail(customer.email.toValue(), customer.name, resetToken);
  }

  public async confirmPasswordReset(token: string, newPass: string): Promise<void> {
    const customer = await this.customerRepo.findByResetToken(token);
    if (!customer || !customer.resetExpires || customer.resetExpires < new Date()) {
      throw new Error('El enlace de recuperación es inválido o ha caducado.');
    }
    const hash = await this.passwordHasher.hash(newPass);
    customer.updatePassword(hash);
    await this.customerRepo.save(customer);
  }
}
