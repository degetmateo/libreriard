import { IStaffUserRepository } from '../../domain/repositories/staff-user.repository.interface';
import { IPasswordHasher } from '../../infrastructure/security/password-hasher.interface';
import { JwtTokenProvider } from '../../infrastructure/security/jwt-token-provider';
import { Email } from '../../domain/value-objects/email.vo';
import { StaffUserMapper } from '../../infrastructure/database/mappers/staff-user.mapper';
import { StaffUserDto, UserType } from '@libreriard/shared';

export interface StaffLoginResult {
  accessToken: string;
  refreshToken: string;
  user: StaffUserDto;
}

export class AuthStaffService {
  constructor(
    private readonly staffRepo: IStaffUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly tokenProvider: JwtTokenProvider
  ) {}

  public async login(emailStr: string, plainPassword: string): Promise<StaffLoginResult> {
    const email = Email.create(emailStr);
    const staff = await this.staffRepo.findByEmail(email);

    if (!staff) {
      throw new Error('Credenciales inválidas. Por favor verifique su correo y contraseña.');
    }

    if (!staff.isActive) {
      throw new Error('Su cuenta de staff se encuentra desactivada. Contacte a un administrador.');
    }

    const isMatch = await this.passwordHasher.compare(plainPassword, staff.passwordHash);
    if (!isMatch) {
      throw new Error('Credenciales inválidas. Por favor verifique su correo y contraseña.');
    }

    const payload = {
      sub: staff.id.toString(),
      email: staff.email.toValue(),
      userType: UserType.STAFF,
      role: staff.role
    };

    const accessToken = this.tokenProvider.generateAccessToken(payload);
    const refreshToken = this.tokenProvider.generateRefreshToken(payload);

    return {
      accessToken,
      refreshToken,
      user: StaffUserMapper.toDto(staff)
    };
  }
}

