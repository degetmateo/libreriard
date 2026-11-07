import { Router } from 'express';
import { StaffController } from '../controllers/staff.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RoleMiddleware } from '../middlewares/role.middleware';
import { ValidateMiddleware } from '../middlewares/validate.middleware';
import { createStaffSchema } from '../schemas/auth.schema';

export class StaffRoutes {
  public static create(controller: StaffController, authMiddleware: AuthMiddleware): Router {
    const router = Router();
    router.use(authMiddleware.authenticate);
    router.use(RoleMiddleware.requireStaff);

    router.get('/', controller.getAll);
    router.post('/', RoleMiddleware.requireAdmin, ValidateMiddleware.validate(createStaffSchema), controller.create);
    router.put('/:id', RoleMiddleware.requireAdmin, controller.update);
    router.post('/:id/reset-password', RoleMiddleware.requireAdmin, controller.resetPassword);
    router.delete('/:id', RoleMiddleware.requireAdmin, controller.delete);
    return router;
  }
}

