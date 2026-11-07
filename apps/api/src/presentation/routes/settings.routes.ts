import { Router } from 'express';
import { SettingsController } from '../controllers/settings.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RoleMiddleware } from '../middlewares/role.middleware';
import { ValidateMiddleware } from '../middlewares/validate.middleware';
import {
  updateBankDetailsSchema,
  updateLegalTextsSchema,
  updateFooterContactSchema,
  catalogItemSchema
} from '../schemas/settings.schema';

export class SettingsRoutes {
  public static create(controller: SettingsController, authMiddleware: AuthMiddleware): Router {
    const router = Router();
    router.get('/', controller.getSettings);

    router.put(
      '/bank-details',
      authMiddleware.authenticate,
      RoleMiddleware.requireAdmin,
      ValidateMiddleware.validate(updateBankDetailsSchema),
      controller.updateBankDetails
    );

    router.put(
      '/legal',
      authMiddleware.authenticate,
      RoleMiddleware.requireAdmin,
      ValidateMiddleware.validate(updateLegalTextsSchema),
      controller.updateLegalTexts
    );

    router.put(
      '/contact',
      authMiddleware.authenticate,
      RoleMiddleware.requireAdmin,
      ValidateMiddleware.validate(updateFooterContactSchema),
      controller.updateFooterContact
    );

    router.post(
      '/categories',
      authMiddleware.authenticate,
      RoleMiddleware.requireStaff,
      ValidateMiddleware.validate(catalogItemSchema),
      controller.addCategory
    );

    router.post(
      '/tags',
      authMiddleware.authenticate,
      RoleMiddleware.requireStaff,
      ValidateMiddleware.validate(catalogItemSchema),
      controller.addTag
    );

    return router;
  }
}
