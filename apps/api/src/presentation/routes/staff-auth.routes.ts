import { Router } from 'express';
import { StaffAuthController } from '../controllers/staff-auth.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RoleMiddleware } from '../middlewares/role.middleware';
import { ValidateMiddleware } from '../middlewares/validate.middleware';
import { loginSchema } from '../schemas/auth.schema';

export class StaffAuthRoutes {
  public static create(controller: StaffAuthController, authMiddleware: AuthMiddleware): Router {
    const router = Router();
    router.post('/login', ValidateMiddleware.validate(loginSchema), controller.login);
    router.post('/refresh', controller.refresh);
    router.post('/logout', controller.logout);
    router.get('/me', authMiddleware.authenticate, RoleMiddleware.requireStaff, controller.me);
    return router;
  }
}

