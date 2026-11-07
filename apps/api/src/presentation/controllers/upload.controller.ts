import { Response, NextFunction } from 'express';
import { IStorageService } from '../../infrastructure/storage/storage-service.interface';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class UploadController {
  constructor(private readonly storageService: IStorageService) {}

  public upload = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No se ha adjuntado ningún archivo de imagen.' });
        return;
      }

      const result = await this.storageService.uploadImage(req.file.buffer, req.file.originalname);
      res.json({
        success: true,
        message: 'Imagen subida exitosamente.',
        data: {
          url: result.url,
          publicId: result.publicId
        }
      });
    } catch (err) { next(err); }
  };
}
