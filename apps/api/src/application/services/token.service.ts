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
    let payload: TokenPayload;
    try {
      payload = this.tokenProvider.verifyRefreshToken(refreshTokenStr);
    } catch {
      throw new Error('Sesión caducada o token de actualización inválido.');
    }

    if (payload.userType === UserType.STAFF) {
      const staff = await this.staffRepo.findById(UUIDv7.fromString(payload.sub));
      if (!staff || !staff.isActive) {
        throw new Error('Usuario de staff no encontrado o inactivo.');
      }
      payload.role = staff.role;
    } else {
      const customer = await this.customerRepo.findById(UUIDv7.fromString(payload.sub));
      if (!customer || !customer.isEmailVerified) {
        throw new Error('Cliente no encontrado o cuenta no activada.');
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
