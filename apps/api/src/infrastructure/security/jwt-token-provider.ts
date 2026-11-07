import jwt, { SignOptions } from 'jsonwebtoken';
import { EnvConfig } from '../config/env.config';
import { UserType, StaffRole } from '@libreriard/shared';

export interface TokenPayload {
  sub: string;
  email: string;
  userType: UserType;
  role?: StaffRole;
  isWholesaleApproved?: boolean;
}

export class JwtTokenProvider {
  private sanitizePayload(payload: TokenPayload): Record<string, unknown> {
    return {
      sub: payload.sub,
      email: payload.email,
      userType: payload.userType,
      role: payload.role,
      isWholesaleApproved: payload.isWholesaleApproved
    };
  }

  public generateAccessToken(payload: TokenPayload): string {
    const clean = this.sanitizePayload(payload);
    const options: SignOptions = {
      expiresIn: EnvConfig.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn']
    };
    return jwt.sign(clean, EnvConfig.JWT_ACCESS_SECRET, options);
  }

  public generateRefreshToken(payload: TokenPayload): string {
    const clean = this.sanitizePayload(payload);
    const options: SignOptions = {
      expiresIn: EnvConfig.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn']
    };
    return jwt.sign(clean, EnvConfig.JWT_REFRESH_SECRET, options);
  }

  public verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, EnvConfig.JWT_ACCESS_SECRET) as TokenPayload;
  }

  public verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, EnvConfig.JWT_REFRESH_SECRET) as TokenPayload;
  }
}
