import { Response, NextFunction } from 'express';
import { IStorageService } from '../../infrastructure/storage/storage-service.interface';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';

export class UploadController {
  constructor(private readonly storageService: IStorageService) {}

  public upload = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'No se ha adjuntado ningún archivo.' });
        return;
      }

      const result = await this.storageService.uploadImage(req.file.buffer, req.file.originalname);
      res.json({
        success: true,
        message: 'Archivo subido exitosamente.',
        data: {
          url: result.url,
          publicId: result.publicId
        }
      });
    } catch (err) { next(err); }
  };

  public deleteImage = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const publicId = req.params.publicId || (req.query.publicId as string) || req.body?.publicId;
      if (!publicId) {
        res.status(400).json({ success: false, message: 'Identificador de imagen requerido.' });
        return;
      }
      await this.storageService.deleteImage(publicId);
      res.json({
        success: true,
        message: 'Imagen eliminada exitosamente.'
      });
    } catch (err) { next(err); }
  };
}
