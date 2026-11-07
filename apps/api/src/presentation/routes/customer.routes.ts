import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RoleMiddleware } from '../middlewares/role.middleware';

export class CustomerRoutes {
  public static create(controller: CustomerController, authMiddleware: AuthMiddleware): Router {
    const router = Router();
    router.use(authMiddleware.authenticate);

    router.get('/', RoleMiddleware.requireStaff, controller.getCustomers);
    router.get('/:id', RoleMiddleware.requireStaff, controller.getById);
    router.put('/:id', RoleMiddleware.requireAdmin, controller.adminUpdateCustomer);
    router.post('/:id/reset-password', RoleMiddleware.requireAdmin, controller.adminResetPassword);
    router.patch('/:id/toggle-active', RoleMiddleware.requireAdmin, controller.toggleCustomerActive);
    router.post('/wholesale-request', RoleMiddleware.requireCustomer, controller.requestWholesale);
    router.put('/:id/review-wholesale', RoleMiddleware.requireAdmin, controller.reviewWholesale);
    return router;
  }
}
