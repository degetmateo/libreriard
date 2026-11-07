import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { UserType, StaffRole } from '@libreriard/shared';

export class RoleMiddleware {
  public static requireStaff(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const userType = String(req.user?.userType || '').toUpperCase();
    if (!req.user || userType !== UserType.STAFF) {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requiere cuenta de personal del staff.'
      });
      return;
    }
    next();
  }

  public static requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const userType = String(req.user?.userType || '').toUpperCase();
    const role = String(req.user?.role || '').toUpperCase();
    if (!req.user || userType !== UserType.STAFF || role !== StaffRole.ADMIN) {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado. Se requieren permisos de administrador.'
      });
      return;
    }
    next();
  }

  public static requireCustomer(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    const userType = String(req.user?.userType || '').toUpperCase();
    if (!req.user || userType !== UserType.CUSTOMER) {
      res.status(403).json({
        success: false,
        message: 'Acceso denegado. Esta acción está reservada a clientes.'
      });
      return;
    }
    next();
  }
}
