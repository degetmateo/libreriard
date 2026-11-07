import { Router } from 'express';
import { AuditLogController } from '../controllers/audit-log.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RoleMiddleware } from '../middlewares/role.middleware';

export class AuditLogRoutes {
  public static create(controller: AuditLogController, authMiddleware: AuthMiddleware): Router {
    const router = Router();
    router.use(authMiddleware.authenticate);
    router.use(RoleMiddleware.requireAdmin);

    router.get('/', controller.getLogs);
    return router;
  }
}

