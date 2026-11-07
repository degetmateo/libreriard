import { Order } from '../entities/order.entity';
import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { OrderNumber } from '../value-objects/order-number.vo';
import { OrderStatus, OrderType } from '@libreriard/shared';

export interface OrderFilterParams {
  customerId?: UUIDv7;
  status?: OrderStatus;
  orderType?: OrderType;
  search?: string;
  page?: number;
  limit?: number;
}

export interface IOrderRepository {
  findById(id: UUIDv7): Promise<Order | null>;
  findByOrderNumber(orderNumber: OrderNumber): Promise<Order | null>;
  findMany(params: OrderFilterParams): Promise<{ items: Order[]; total: number }>;
  save(order: Order): Promise<void>;
}

