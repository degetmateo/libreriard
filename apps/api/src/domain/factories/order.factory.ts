import { Order } from '../entities/order.entity';
import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { OrderNumber } from '../value-objects/order-number.vo';
import { Money } from '../value-objects/money.vo';
import { OrderType, OrderStatus, OrderItemDto, CustomerSnapshotDto, PaymentMethod, DeliveryMethod } from '@libreriard/shared';

export interface CreateOrderParams {
  customerId: UUIDv7;
  customerSnapshot: CustomerSnapshotDto;
  orderType: OrderType;
  items: OrderItemDto[];
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  transferReceiptUrl?: string;
  transferReceiptName?: string;
  notes?: string;
}

export class OrderFactory {
  public static create(p: CreateOrderParams): Order {
    const subtotalNum = p.items.reduce((acc, item) => acc + item.subtotal, 0);
    const subtotal = Money.from(subtotalNum);
    const discount = Money.zero();
    const total = subtotal;

    return new Order({
      id: UUIDv7.generate(),
      orderNumber: OrderNumber.generate(),
      orderType: p.orderType,
      customerId: p.customerId,
      customerSnapshot: p.customerSnapshot,
      items: p.items,
      subtotal,
      discount,
      total,
      paymentMethod: p.paymentMethod,
      deliveryMethod: p.deliveryMethod,
      deliveryAddress: p.deliveryAddress,
      transferReceiptUrl: p.transferReceiptUrl,
      transferReceiptName: p.transferReceiptName,
      status: OrderStatus.PENDING,
      notes: p.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
