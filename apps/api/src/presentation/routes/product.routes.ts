import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RoleMiddleware } from '../middlewares/role.middleware';
import { ValidateMiddleware } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

export class ProductRoutes {
  public static create(controller: ProductController, authMiddleware: AuthMiddleware): Router {
    const router = Router();
    router.get('/', controller.getProducts);
    router.get('/:id', controller.getById);

    // Protected staff operations
    router.post('/', authMiddleware.authenticate, RoleMiddleware.requireStaff, ValidateMiddleware.validate(createProductSchema), controller.create);
    router.put('/:id', authMiddleware.authenticate, RoleMiddleware.requireStaff, ValidateMiddleware.validate(updateProductSchema), controller.update);
    router.patch('/:id/toggle-active', authMiddleware.authenticate, RoleMiddleware.requireStaff, controller.toggleActive);
    router.delete('/:id', authMiddleware.authenticate, RoleMiddleware.requireStaff, controller.delete);
    return router;
  }
}
