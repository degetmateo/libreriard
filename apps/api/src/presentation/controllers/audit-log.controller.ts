import { Response, NextFunction } from 'express';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AuditLogTag } from '@libreriard/shared';

export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  public getLogs = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const tag = req.query.tag as AuditLogTag;
      const entityType = req.query.entityType as string;
      const actorId = req.query.actorId as string;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const result = await this.auditLogService.getLogs({ tag, entityType, actorId, page, limit });
      res.json({ success: true, data: result.items, total: result.total, page, limit });
    } catch (err) { next(err); }
  };
}

