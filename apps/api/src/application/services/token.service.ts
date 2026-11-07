import { JwtTokenProvider, TokenPayload } from '../../infrastructure/security/jwt-token-provider';
import { IStaffUserRepository } from '../../domain/repositories/staff-user.repository.interface';
import { ICustomerUserRepository } from '../../domain/repositories/customer-user.repository.interface';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.vo';
import { UserType } from '@libreriard/shared';

export class TokenService {
  constructor(
    private readonly tokenProvider: JwtTokenProvider,
    private readonly staffRepo: IStaffUserRepository,
    private readonly customerRepo: ICustomerUserRepository
  ) {}

  public async refreshAccessToken(refreshTokenStr: string): Promise<{ accessToken: string; userPayload: TokenPayload }> {
    let rawPayload: TokenPayload;
    try {
      rawPayload = this.tokenProvider.verifyRefreshToken(refreshTokenStr);
    } catch {
      throw new Error('Sesión caducada o token de actualización inválido.');
    }

    const isStaff = String(rawPayload.userType || '').toUpperCase() === UserType.STAFF;
    const payload: TokenPayload = {
      sub: rawPayload.sub,
      email: rawPayload.email,
      userType: isStaff ? UserType.STAFF : UserType.CUSTOMER
    };

    if (isStaff) {
      const staff = await this.staffRepo.findById(UUIDv7.fromString(rawPayload.sub));
      if (!staff || !staff.isActive) {
        throw new Error('Usuario de staff no encontrado o inactivo.');
      }
      payload.role = staff.role;
    } else {
      const customer = await this.customerRepo.findById(UUIDv7.fromString(rawPayload.sub));
      if (!customer || !customer.isEmailVerified) {
        throw new Error('Cliente no encontrado o cuenta no activada.');
      }
      if (!customer.isActive) {
        throw new Error('Tu cuenta se encuentra desactivada.');
      }
      payload.isWholesaleApproved = customer.isWholesaleApproved;
    }

    const newAccessToken = this.tokenProvider.generateAccessToken(payload);
    return {
      accessToken: newAccessToken,
      userPayload: payload
    };
  }
}
