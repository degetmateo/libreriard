import { Response, NextFunction } from 'express';
import { StaffManagementService } from '../../application/services/staff-management.service';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AuditLogTag } from '@libreriard/shared';

export class StaffController {
  constructor(
    private readonly staffService: StaffManagementService,
    private readonly auditLogService: AuditLogService
  ) {}

  public getAll = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const staffList = await this.staffService.getAllStaff();
      res.json({ success: true, data: staffList });
    } catch (err) { next(err); }
  };

  public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const created = await this.staffService.createStaff(req.body);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'STAFF_CREATED',
        { type: 'StaffUser', id: created.id },
        { before: null, after: created as any },
        [AuditLogTag.STAFF]
      );
      res.status(201).json({ success: true, message: 'Usuario de staff creado exitosamente.', data: created });
    } catch (err) { next(err); }
  };

  public update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.staffService.updateStaff(id, req.body);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'STAFF_UPDATED',
        { type: 'StaffUser', id: updated.id },
        { before: null, after: updated as any },
        [AuditLogTag.STAFF]
      );
      res.json({ success: true, message: 'Usuario de staff actualizado exitosamente.', data: updated });
    } catch (err) { next(err); }
  };

  public resetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.staffService.resetPassword(id, req.body.newPassword);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'STAFF_PASSWORD_RESET_BY_ADMIN',
        { type: 'StaffUser', id },
        { before: null, after: null },
        [AuditLogTag.STAFF, AuditLogTag.AUTH]
      );
      res.json({ success: true, message: 'Contraseña del miembro de staff restablecida correctamente.' });
    } catch (err) { next(err); }
  };

  public delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.staffService.deleteStaff(id);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'STAFF_DELETED',
        { type: 'StaffUser', id },
        { before: null, after: null },
        [AuditLogTag.STAFF]
      );
      res.json({ success: true, message: 'Miembro del staff eliminado correctamente.' });
    } catch (err) { next(err); }
  };
}
