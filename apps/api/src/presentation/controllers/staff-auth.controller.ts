import { Request, Response, NextFunction } from 'express';
import { AuthStaffService } from '../../application/services/auth-staff.service';
import { TokenService } from '../../application/services/token.service';
import { AuditLogService } from '../../application/services/audit-log.service';
import { IStaffUserRepository } from '../../domain/repositories/staff-user.repository.interface';
import { StaffUserMapper } from '../../infrastructure/database/mappers/staff-user.mapper';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { EnvConfig } from '../../infrastructure/config/env.config';
import { AuditLogTag, UserType } from '@libreriard/shared';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.vo';

export class StaffAuthController {
  constructor(
    private readonly authStaffService: AuthStaffService,
    private readonly tokenService: TokenService,
    private readonly auditLogService: AuditLogService,
    private readonly staffRepo: IStaffUserRepository
  ) {}

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authStaffService.login(email, password);

      const cookieOpts = {
        httpOnly: true,
        secure: EnvConfig.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000
      };

      res.cookie('staffRefreshToken', result.refreshToken, cookieOpts);
      res.cookie('refreshToken', result.refreshToken, cookieOpts);

      await this.auditLogService.logAction(
        { id: result.user.id, name: result.user.name, email: result.user.email, role: result.user.role, ip: req.ip },
        'STAFF_LOGIN',
        { type: 'StaffUser', id: result.user.id },
        { before: null, after: null },
        [AuditLogTag.AUTH, AuditLogTag.STAFF]
      );

      res.json({
        success: true,
        message: `¡Bienvenido/a al panel, ${result.user.name}!`,
        data: { accessToken: result.accessToken, user: result.user }
      });
    } catch (err) {
      next(err);
    }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.staffRefreshToken || req.cookies?.refreshToken || req.headers['x-refresh-token'];
      if (!token) {
        res.status(401).json({ success: false, message: 'No se encontró token de actualización de staff.' });
        return;
      }

      const result = await this.tokenService.refreshAccessToken(token as string);
      if (String(result.userPayload.userType).toUpperCase() !== UserType.STAFF) {
        res.status(401).json({ success: false, message: 'La sesión no corresponde a personal del staff.' });
        return;
      }

      res.json({
        success: true,
        message: 'Token renovado exitosamente.',
        data: { accessToken: result.accessToken }
      });
    } catch (err) {
      next(err);
    }
  };

  public logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie('staffRefreshToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Sesión cerrada correctamente.' });
  };

  public me = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user?.sub) {
        res.status(401).json({ success: false, message: 'No autenticado.' });
        return;
      }
      const staff = await this.staffRepo.findById(UUIDv7.fromString(req.user.sub));
      if (!staff || !staff.isActive) {
        res.status(401).json({ success: false, message: 'Usuario no encontrado o inactivo.' });
        return;
      }
      res.json({ success: true, data: StaffUserMapper.toDto(staff) });
    } catch (err) {
      next(err);
    }
  };
}
