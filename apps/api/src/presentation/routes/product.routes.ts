import { Router } from 'express';
import multer from 'multer';
import { ProductController } from '../controllers/product.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RoleMiddleware } from '../middlewares/role.middleware';
import { ValidateMiddleware } from '../middlewares/validate.middleware';
import { createProductSchema, updateProductSchema } from '../schemas/product.schema';

export class ProductRoutes {
  public static create(controller: ProductController, authMiddleware: AuthMiddleware): Router {
    const router = Router();
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 50 * 1024 * 1024 } // 50MB for massive imports
    });

    // Public / Protected price lists
    router.get('/price-list/excel', authMiddleware.authenticate, controller.exportPriceList);
    router.get('/export/excel', authMiddleware.authenticate, RoleMiddleware.requireStaff, controller.exportExcel);
    router.get('/price-history', authMiddleware.authenticate, RoleMiddleware.requireStaff, controller.getAllPriceHistory);
    router.get('/:id/price-history', authMiddleware.authenticate, RoleMiddleware.requireStaff, controller.getProductPriceHistory);
    router.post('/import/excel', authMiddleware.authenticate, RoleMiddleware.requireStaff, upload.single('file'), controller.importExcel);
    router.post('/import/massive', authMiddleware.authenticate, RoleMiddleware.requireStaff, upload.single('file'), controller.importMassive);

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
