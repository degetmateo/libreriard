import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../../application/services/product.service';
import { ProductExcelService } from '../../application/services/product-excel.service';
import { AuditLogService } from '../../application/services/audit-log.service';
import { PriceHistoryService } from '../../application/services/price-history.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { AuditLogTag, UserType } from '@libreriard/shared';

export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly excelService: ProductExcelService,
    private readonly auditLogService: AuditLogService,
    private readonly priceHistoryService?: PriceHistoryService
  ) {}

  public getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { search, category, tag, barcode, sortBy, sortOrder } = req.query as Record<string, string>;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 24;

      const result = await this.productService.getProducts({
        search,
        category,
        tag,
        barcode,
        sortBy,
        sortOrder: sortOrder as 'asc' | 'desc',
        page,
        limit
      });
      res.json({
        success: true,
        data: result.items,
        total: result.total,
        page,
        limit,
        totalPages: Math.ceil(result.total / limit)
      });
    } catch (err) { next(err); }
  };

  public getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.getProductById(String(req.params.id));
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
      const updated = await this.productService.updateProduct(id, req.body, {
        id: req.user!.sub,
        name: req.user!.email,
        email: req.user!.email
      });
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

  public getProductPriceHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.priceHistoryService) {
        res.status(500).json({ success: false, message: 'Servicio de historial de precios no configurado.' });
        return;
      }
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await this.priceHistoryService.getProductPriceHistory(String(req.params.id), page, limit);
      res.json({
        success: true,
        data: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      });
    } catch (err) { next(err); }
  };

  public getAllPriceHistory = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.priceHistoryService) {
        res.status(500).json({ success: false, message: 'Servicio de historial de precios no configurado.' });
        return;
      }
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const result = await this.priceHistoryService.getAllPriceHistory(page, limit);
      res.json({
        success: true,
        data: result.items,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      });
    } catch (err) { next(err); }
  };

  public toggleActive = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const updated = await this.productService.toggleProductActive(id);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        updated.isActive ? 'PRODUCT_ACTIVATED' : 'PRODUCT_DEACTIVATED',
        { type: 'Product', id: updated.id },
        { before: null, after: { isActive: updated.isActive } },
        [AuditLogTag.PRODUCT]
      );
      res.json({ success: true, message: `Producto ${updated.isActive ? 'activado' : 'desactivado'}.`, data: updated });
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

  public exportExcel = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const buffer = await this.excelService.exportProductsToExcel();
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="productos-libreria-ruben-dario.xlsx"');
      res.send(buffer);
    } catch (err) { next(err); }
  };

  public exportPriceList = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isWholesale = Boolean(req.user?.isWholesaleApproved);
      const buffer = await this.excelService.exportCustomerPriceList(isWholesale);
      const filename = isWholesale ? 'lista-precios-mayorista.xlsx' : 'lista-precios-minorista.xlsx';
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(buffer);
    } catch (err) { next(err); }
  };

  public importExcel = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: 'Debe adjuntar un archivo de Excel o CSV.' });
        return;
      }
      const result = await this.excelService.importProductsFromExcel(req.file.buffer);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'PRODUCTS_EXCEL_IMPORTED',
        { type: 'ProductBatch', id: 'bulk-excel' },
        { before: null, after: { created: result.created, updated: result.updated } },
        [AuditLogTag.PRODUCT, AuditLogTag.STAFF]
      );
      res.json({
        success: true,
        message: `Importación completada: ${result.created} productos nuevos, ${result.updated} actualizados.`,
        data: result
      });
    } catch (err) { next(err); }
  };

  public importMassive = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      let items: any[] = [];
      if (req.file) {
        const fileContent = req.file.buffer.toString('utf-8');
        try {
          items = JSON.parse(fileContent);
        } catch {
          // If not json, parse via excel/csv
          const result = await this.excelService.importProductsFromExcel(req.file.buffer);
          res.json({
            success: true,
            message: `Carga masiva completada: ${result.created} insertados, ${result.updated} actualizados.`,
            data: result
          });
          return;
        }
      } else if (Array.isArray(req.body.products)) {
        items = req.body.products;
      } else if (Array.isArray(req.body)) {
        items = req.body;
      } else {
        res.status(400).json({ success: false, message: 'Formato no válido. Debe enviar un archivo JSON/Excel o un array de productos.' });
        return;
      }

      const result = await this.excelService.importMassiveProducts(items);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'PRODUCTS_MASSIVE_IMPORTED',
        { type: 'ProductBatch', id: 'bulk-massive' },
        { before: null, after: { inserted: result.inserted, updated: result.updated } },
        [AuditLogTag.PRODUCT, AuditLogTag.STAFF]
      );
      res.json({
        success: true,
        message: `Carga masiva completada: ${result.inserted} productos nuevos, ${result.updated} actualizados.`,
        data: result
      });
    } catch (err) { next(err); }
  };
}
