import { Request, Response, NextFunction } from 'express';
import { AuthCustomerService } from '../../application/services/auth-customer.service';
import { TokenService } from '../../application/services/token.service';
import { AuditLogService } from '../../application/services/audit-log.service';
import { EnvConfig } from '../../infrastructure/config/env.config';
import { AuditLogTag, UserType } from '@libreriard/shared';

export class CustomerAuthController {
  constructor(
    private readonly authCustomerService: AuthCustomerService,
    private readonly tokenService: TokenService,
    private readonly auditLogService: AuditLogService
  ) {}

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = await this.authCustomerService.register(req.body);
      await this.auditLogService.logAction(
        { id: user.id, name: user.name, email: user.email, role: 'CUSTOMER', ip: req.ip },
        'CUSTOMER_REGISTER',
        { type: 'CustomerUser', id: user.id },
        { before: null, after: user as any },
        [AuditLogTag.AUTH, AuditLogTag.CUSTOMER]
      );
      res.status(201).json({
        success: true,
        message: 'Registro exitoso. Te hemos enviado un correo para que actives tu cuenta antes de iniciar sesión.',
        data: user
      });
    } catch (err) { next(err); }
  };

  public activate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token } = req.body;
      await this.authCustomerService.activateAccount(token);
      res.json({ success: true, message: '¡Cuenta activada con éxito! Ya puedes iniciar sesión con tu correo y contraseña.' });
    } catch (err) { next(err); }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const result = await this.authCustomerService.login(email, password);

      const cookieOpts = {
        httpOnly: true,
        secure: EnvConfig.NODE_ENV === 'production',
        sameSite: 'lax' as const,
        maxAge: 7 * 24 * 60 * 60 * 1000
      };

      res.cookie('customerRefreshToken', result.refreshToken, cookieOpts);
      res.cookie('refreshToken', result.refreshToken, cookieOpts);

      res.json({
        success: true,
        message: `¡Hola de nuevo, ${result.user.name}!`,
        data: { accessToken: result.accessToken, user: result.user }
      });
    } catch (err) { next(err); }
  };

  public forgotPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.authCustomerService.requestPasswordReset(req.body.email);
      res.json({ success: true, message: 'Si el correo está registrado, recibirás un enlace para restablecer tu contraseña.' });
    } catch (err) { next(err); }
  };

  public resetPassword = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { token, newPassword } = req.body;
      await this.authCustomerService.confirmPasswordReset(token, newPassword);
      res.json({ success: true, message: 'Tu contraseña ha sido actualizada exitosamente. Ahora puedes iniciar sesión.' });
    } catch (err) { next(err); }
  };

  public refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const token = req.cookies?.customerRefreshToken || req.cookies?.refreshToken || req.headers['x-refresh-token'];
      if (!token) {
        res.status(401).json({ success: false, message: 'No se encontró token de actualización de cliente.' });
        return;
      }
      const result = await this.tokenService.refreshAccessToken(token as string);
      if (String(result.userPayload.userType).toUpperCase() !== UserType.CUSTOMER) {
        res.status(401).json({ success: false, message: 'La sesión no corresponde a una cuenta de cliente.' });
        return;
      }
      res.json({ success: true, message: 'Token renovado.', data: { accessToken: result.accessToken } });
    } catch (err) { next(err); }
  };

  public logout = async (_req: Request, res: Response): Promise<void> => {
    res.clearCookie('customerRefreshToken');
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'Sesión finalizada exitosamente.' });
  };
}
