import { Response, NextFunction } from 'express';
import { CustomerManagementService } from '../../application/services/customer-management.service';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AuditLogTag } from '@libreriard/shared';

export class CustomerController {
  constructor(
    private readonly customerService: CustomerManagementService,
    private readonly auditLogService: AuditLogService
  ) {}

  public getCustomers = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const search = req.query.search as string;
      const wholesalePendingOnly = req.query.wholesalePendingOnly === 'true';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const result = await this.customerService.getCustomers({ search, wholesalePendingOnly, page, limit });
      res.json({ success: true, data: result.items, total: result.total, page, limit });
    } catch (err) { next(err); }
  };

  public getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const customer = await this.customerService.getCustomerById(String(req.params.id));
      res.json({ success: true, data: customer });
    } catch (err) { next(err); }
  };

  public adminUpdateCustomer = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.customerService.adminUpdateCustomer(id, req.body);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'CUSTOMER_UPDATED_BY_ADMIN',
        { type: 'CustomerUser', id },
        { before: null, after: updated as any },
        [AuditLogTag.CUSTOMER, AuditLogTag.STAFF]
      );
      res.json({ success: true, message: 'Datos del cliente actualizados con éxito.', data: updated });
    } catch (err) { next(err); }
  };

  public adminResetPassword = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.customerService.adminResetPassword(id, req.body.newPassword);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'CUSTOMER_PASSWORD_RESET_BY_ADMIN',
        { type: 'CustomerUser', id },
        { before: null, after: null },
        [AuditLogTag.CUSTOMER, AuditLogTag.AUTH]
      );
      res.json({ success: true, message: 'Contraseña del cliente restablecida correctamente.' });
    } catch (err) { next(err); }
  };

  public toggleCustomerActive = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.customerService.toggleCustomerActive(id);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        updated.isActive ? 'CUSTOMER_ACTIVATED' : 'CUSTOMER_DEACTIVATED',
        { type: 'CustomerUser', id },
        { before: null, after: { isActive: updated.isActive } },
        [AuditLogTag.CUSTOMER, AuditLogTag.STAFF]
      );
      res.json({ success: true, message: `Cliente ${updated.isActive ? 'activado' : 'desactivado'} con éxito.`, data: updated });
    } catch (err) { next(err); }
  };

  public requestWholesale = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.customerService.requestWholesale(req.user!.sub, req.body.message);
      res.json({ success: true, message: 'Tu solicitud de cliente mayorista ha sido enviada a los administradores.' });
    } catch (err) { next(err); }
  };

  public reviewWholesale = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.customerService.reviewWholesale(id, req.body.approved);
      res.json({ success: true, message: req.body.approved ? 'Solicitud mayorista aprobada.' : 'Solicitud mayorista rechazada.', data: updated });
    } catch (err) { next(err); }
  };
}
