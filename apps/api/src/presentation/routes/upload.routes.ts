import { Router } from 'express';
import multer from 'multer';
import { UploadController } from '../controllers/upload.controller';
import { AuthMiddleware } from '../middlewares/auth.middleware';
import { RoleMiddleware } from '../middlewares/role.middleware';

export class UploadRoutes {
  public static create(controller: UploadController, authMiddleware: AuthMiddleware): Router {
    const router = Router();
    const upload = multer({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
    });

    router.post(
      '/image',
      authMiddleware.authenticate,
      RoleMiddleware.requireStaff,
      upload.single('image'),
      controller.upload
    );
    return router;
  }
}
