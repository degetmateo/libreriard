import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RoleMiddleware } from '../middlewares/role.middleware';
import { ValidateMiddleware } from '../middlewares/validate.middleware';
import { createOrderSchema, updateOrderStatusSchema } from '../schemas/order.schema';

export class OrderRoutes {
  public static create(controller: OrderController, authMiddleware: AuthMiddleware): Router {
    const router = Router();
    router.use(authMiddleware.authenticate);

    router.post('/', RoleMiddleware.requireCustomer, ValidateMiddleware.validate(createOrderSchema), controller.create);
    router.post('/manual', RoleMiddleware.requireStaff, controller.createManual);
    router.get('/statistics', RoleMiddleware.requireStaff, controller.getStatistics);
    router.get('/', controller.getOrders);
    router.put('/:id/status', RoleMiddleware.requireStaff, ValidateMiddleware.validate(updateOrderStatusSchema), controller.updateStatus);
    return router;
  }
}

