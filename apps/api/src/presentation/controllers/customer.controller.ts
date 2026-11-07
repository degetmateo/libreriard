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
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const result = await this.customerService.getCustomers({ search, wholesalePendingOnly, page, limit });
      res.json({ success: true, data: result.items, total: result.total, page, limit });
    } catch (err) { next(err); }
  };

  public getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const customer = await this.customerService.getCustomerById(id);
      res.json({ success: true, data: customer });
    } catch (err) { next(err); }
  };

  public requestWholesale = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.customerService.requestWholesale(req.user!.sub, req.body.message);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: 'CUSTOMER', ip: req.ip },
        'WHOLESALE_REQUEST_SUBMITTED',
        { type: 'CustomerUser', id: req.user!.sub },
        { before: null, after: { message: req.body.message } },
        [AuditLogTag.CUSTOMER]
      );
      res.json({ success: true, message: 'Tu solicitud de cliente mayorista ha sido enviada a los administradores.' });
    } catch (err) { next(err); }
  };

  public reviewWholesale = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { approved } = req.body;
      const updated = await this.customerService.reviewWholesale(id, approved);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        approved ? 'WHOLESALE_REQUEST_APPROVED' : 'WHOLESALE_REQUEST_REJECTED',
        { type: 'CustomerUser', id },
        { before: null, after: { isWholesaleApproved: approved } },
        [AuditLogTag.CUSTOMER, AuditLogTag.STAFF]
      );
      res.json({
        success: true,
        message: approved ? 'Solicitud mayorista aprobada.' : 'Solicitud mayorista rechazada.',
        data: updated
      });
    } catch (err) { next(err); }
  };
}
