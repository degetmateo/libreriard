import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RoleMiddleware } from '../middlewares/role.middleware';
import { ValidateMiddleware } from '../middlewares/validate.middleware';
import { updateBankDetailsSchema } from '../schemas/settings.schema';

export class SettingsRoutes {
  public static create(controller: SettingsController, authMiddleware: AuthMiddleware): Router {
    const router = Router();
    // Public retrieval so customer checkout can display bank transfer details
    router.get('/', controller.getSettings);

    // Admin-only update
    router.put(
      '/bank-details',
      authMiddleware.authenticate,
      RoleMiddleware.requireAdmin,
      ValidateMiddleware.validate(updateBankDetailsSchema),
      controller.updateBankDetails
    );
    return router;
  }
}
