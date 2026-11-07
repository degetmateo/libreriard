import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../../application/services/product.service';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AuditLogTag } from '@libreriard/shared';

export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly auditLogService: AuditLogService
  ) {}

  public getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, category, tag, barcode } = req.query as Record<string, string>;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 24;

      const result = await this.productService.getProducts({ search, category, tag, barcode, page, limit });
      res.json({ success: true, data: result.items, total: result.total, page, limit });
    } catch (err) { next(err); }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const product = await this.productService.getProductById(id);
      res.json({ success: true, data: product });
    } catch (err) { next(err); }
  };

  public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.createProduct(req.body);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'PRODUCT_CREATED',
        { type: 'Product', id: product.id },
        { before: null, after: product as any },
        [AuditLogTag.PRODUCT]
      );
      res.status(201).json({ success: true, message: 'Producto registrado exitosamente.', data: product });
    } catch (err) { next(err); }
  };

  public update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.productService.updateProduct(id, req.body);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'PRODUCT_UPDATED',
        { type: 'Product', id: updated.id },
        { before: null, after: updated as any },
        [AuditLogTag.PRODUCT]
      );
      res.json({ success: true, message: 'Producto actualizado con éxito.', data: updated });
    } catch (err) { next(err); }
  };

  public delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      await this.productService.deleteProduct(id);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'PRODUCT_DELETED',
        { type: 'Product', id },
        { before: null, after: null },
        [AuditLogTag.PRODUCT]
      );
      res.json({ success: true, message: 'Producto eliminado correctamente.' });
    } catch (err) { next(err); }
  };
}
