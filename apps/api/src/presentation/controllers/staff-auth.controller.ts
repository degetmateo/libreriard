import { Request, Response, NextFunction } from 'express';
import { AuthStaffService } from '../../application/services/auth-staff.service';
import { TokenService } from '../../application/services/token.service';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { EnvConfig } from '../../infrastructure/config/env.config';
import { AuditLogTag } from '@libreriard/shared';

export class StaffAuthController {
  constructor(
    private readonly authStaffService: AuthStaffService,
    private readonly tokenService: TokenService,
    private readonly auditLogService: AuditLogService
  ) {}

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authStaffService.login(email, password);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: EnvConfig.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

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
      const token = req.cookies?.refreshToken || req.headers['x-refresh-token'];
      if (!token) {
        res.status(401).json({ success: false, message: 'No se encontró token de actualización.' });
        return;
      }

      const result = await this.tokenService.refreshAccessToken(token as string);
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
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Sesión cerrada correctamente.' });
  };

  public me = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    res.json({ success: true, data: req.user });
  };
}
