import { Order } from '../../../domain/entities/order.entity';
import { OrderNumber } from '../../../domain/value-objects/order-number.vo';
import { Money } from '../../../domain/value-objects/money.vo';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { OrderDto, OrderType, OrderStatus, PaymentMethod, DeliveryMethod } from '@libreriard/shared';
import { Document } from 'mongodb';

export class OrderMapper {
  public static toDomain(doc: Document): Order {
    return new Order({
      id: BsonUuidHelper.fromBsonUuid(doc._id),
      orderNumber: OrderNumber.fromString(doc.orderNumber),
      orderType: doc.orderType as OrderType,
      customerId: BsonUuidHelper.fromBsonUuid(doc.customerId),
      customerSnapshot: doc.customerSnapshot,
      items: doc.items || [],
      subtotal: Money.from(doc.subtotal),
      discount: Money.from(doc.discount || 0),
      total: Money.from(doc.total),
      paymentMethod: doc.paymentMethod as PaymentMethod,
      deliveryMethod: doc.deliveryMethod as DeliveryMethod,
      deliveryAddress: doc.deliveryAddress,
      status: doc.status as OrderStatus,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  public static toPersistence(entity: Order): Document {
    return {
      _id: BsonUuidHelper.toBsonUuid(entity.id),
      orderNumber: entity.orderNumber.toValue(),
      orderType: entity.orderType,
      customerId: BsonUuidHelper.toBsonUuid(entity.customerId),
      customerSnapshot: entity.customerSnapshot,
      items: entity.items,
      subtotal: entity.subtotal.getAmount(),
      discount: entity.discount.getAmount(),
      total: entity.total.getAmount(),
      paymentMethod: entity.paymentMethod,
      deliveryMethod: entity.deliveryMethod,
      deliveryAddress: entity.deliveryAddress,
      status: entity.status,
      notes: entity.notes,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  public static toDto(entity: Order): OrderDto {
    return {
      id: entity.id.toString(),
      orderNumber: entity.orderNumber.toValue(),
      orderType: entity.orderType,
      customer: entity.customerSnapshot,
      items: entity.items,
      subtotal: entity.subtotal.getAmount(),
      discount: entity.discount.getAmount(),
      total: entity.total.getAmount(),
      paymentMethod: entity.paymentMethod,
      deliveryMethod: entity.deliveryMethod,
      deliveryAddress: entity.deliveryAddress,
      status: entity.status,
      notes: entity.notes,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString()
    };
  }
}
