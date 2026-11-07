import { Response, NextFunction } from 'express';
import { OrderService } from '../../application/services/order.service';
import { ManualOrderService } from '../../application/services/manual-order.service';
import { BusinessStatisticsService } from '../../application/services/business-statistics.service';
import { AuditLogService } from '../../application/services/audit-log.service';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.vo';
import { AuditLogTag, UserType, OrderStatus, OrderType } from '@libreriard/shared';

export class OrderController {
  constructor(
    private readonly orderService: OrderService,
    private readonly manualOrderService: ManualOrderService,
    private readonly auditLogService: AuditLogService,
    private readonly statisticsService?: BusinessStatisticsService
  ) {}

  public getStatistics = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!this.statisticsService) {
        res.status(500).json({ success: false, message: 'Servicio de estadísticas no configurado.' });
        return;
      }
      const data = await this.statisticsService.getStatistics();
      res.json({ success: true, data });
    } catch (err) { next(err); }
  };

  public create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.orderService.createOrder(req.user!.sub, req.body);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: 'CUSTOMER', ip: req.ip },
        'ORDER_CREATED',
        { type: 'Order', id: order.id },
        { before: null, after: order as any },
        [AuditLogTag.ORDER]
      );
      res.status(201).json({
        success: true,
        message: `¡Orden #${order.orderNumber} creada con éxito! Se ha enviado el comprobante a tu email.`,
        data: order
      });
    } catch (err) { next(err); }
  };

  public createManual = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const order = await this.manualOrderService.createManualOrder(req.user!.sub, req.body);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'ORDER_CREATED_MANUAL',
        { type: 'Order', id: order.id },
        { before: null, after: order as any },
        [AuditLogTag.ORDER, AuditLogTag.STAFF]
      );
      res.status(201).json({
        success: true,
        message: `¡Orden manual #${order.orderNumber} creada con éxito!`,
        data: order
      });
    } catch (err) { next(err); }
  };

  public getOrders = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const isStaff = req.user!.userType === UserType.STAFF;
      const customerId = isStaff
        ? (req.query.customerId ? UUIDv7.fromString(req.query.customerId as string) : undefined)
        : UUIDv7.fromString(req.user!.sub);

      const status = req.query.status as OrderStatus;
      const orderType = req.query.orderType as OrderType;
      const search = req.query.search as string;
      const sortBy = req.query.sortBy as string;
      const sortOrder = req.query.sortOrder as 'asc' | 'desc';
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 15;

      const result = await this.orderService.getOrders({
        customerId,
        status,
        orderType,
        search,
        sortBy,
        sortOrder,
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

  public updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = String(req.params.id);
      const { status, notes } = req.body;
      const updated = await this.orderService.updateOrderStatus(id, status, notes);
      await this.auditLogService.logAction(
        { id: req.user!.sub, name: req.user!.email, email: req.user!.email, role: req.user!.role!, ip: req.ip },
        'ORDER_STATUS_UPDATED',
        { type: 'Order', id: updated.id },
        { before: null, after: { status, notes } },
        [AuditLogTag.ORDER, AuditLogTag.STAFF]
      );
      res.json({ success: true, message: `Estado de la orden actualizado a ${status}.`, data: updated });
    } catch (err) { next(err); }
  };
}
