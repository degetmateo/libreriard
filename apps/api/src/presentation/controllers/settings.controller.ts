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

  public updateLegalTexts = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { termsAndConditions, privacyPolicy } = req.body;
      const updated = await this.settingsService.updateLegalTexts(termsAndConditions, privacyPolicy, req.user!.sub);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'LEGAL_TEXTS_UPDATED',
        { type: 'Setting', id: 'legal_texts' },
        { before: null, after: { termsAndConditions, privacyPolicy } },
        [AuditLogTag.SETTINGS, AuditLogTag.STAFF]
      );
      res.json({ success: true, message: 'Términos y condiciones y política de privacidad actualizados.', data: updated });
    } catch (err) { next(err); }
  };

  public updateFooterContact = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.settingsService.updateFooterContact(req.body.footerContact, req.user!.sub);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'FOOTER_CONTACT_UPDATED',
        { type: 'Setting', id: 'footer_contact' },
        { before: null, after: req.body.footerContact },
        [AuditLogTag.SETTINGS, AuditLogTag.STAFF]
      );
      res.json({ success: true, message: 'Datos de contacto y ubicación actualizados.', data: updated });
    } catch (err) { next(err); }
  };

  public addCategory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.settingsService.addCategory(req.body.item);
      res.json({ success: true, message: 'Categoría agregada exitosamente.', data: updated });
    } catch (err) { next(err); }
  };

  public addTag = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const updated = await this.settingsService.addTag(req.body.item);
      res.json({ success: true, message: 'Etiqueta agregada exitosamente.', data: updated });
    } catch (err) { next(err); }
  };
}
