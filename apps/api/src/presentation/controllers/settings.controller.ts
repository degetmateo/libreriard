import { Request, Response, NextFunction } from 'express';
import { SystemSettingsService } from '../../application/services/system-settings.service';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AuditLogTag } from '@libreriard/shared';

export class SettingsController {
  constructor(
    private readonly settingsService: SystemSettingsService,
    private readonly auditLogService: AuditLogService
  ) {}

  public getSettings = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const settings = await this.settingsService.getSettings();
      res.json({ success: true, data: settings });
    } catch (err) { next(err); }
  };

  public updateBankDetails = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.settingsService.updateBankDetails(req.body.bankTransferDetails, req.user!.sub);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'BANK_DETAILS_UPDATED',
        { type: 'Setting', id: 'bank_transfer_details' },
        { before: null, after: req.body.bankTransferDetails },
        [AuditLogTag.SETTINGS, AuditLogTag.STAFF]
      );
      res.json({ success: true, message: 'Datos bancarios actualizados exitosamente.', data: updated });
    } catch (err) { next(err); }
  };
}
