import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { OrderNumber } from '../value-objects/order-number.vo';
import { Money } from '../value-objects/money.vo';
import { OrderStatus, OrderType, PaymentMethod, DeliveryMethod, OrderItemDto, CustomerSnapshotDto } from '@libreriard/shared';

export interface OrderProps {
  id?: UUIDv7;
  orderNumber?: OrderNumber;
  orderType: OrderType;
  customerId: UUIDv7;
  customerSnapshot: CustomerSnapshotDto;
  items: OrderItemDto[];
  subtotal: Money;
  discount?: Money;
  total: Money;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  status?: OrderStatus;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Order {
  private readonly _id: UUIDv7;
  private readonly _orderNumber: OrderNumber;
  private readonly _orderType: OrderType;
  private readonly _customerId: UUIDv7;
  private readonly _customerSnapshot: CustomerSnapshotDto;
  private readonly _items: OrderItemDto[];
  private readonly _subtotal: Money;
  private readonly _discount: Money;
  private readonly _total: Money;
  private readonly _paymentMethod: PaymentMethod;
  private readonly _deliveryMethod: DeliveryMethod;
  private readonly _deliveryAddress?: string;
  private _status: OrderStatus;
  private _notes?: string;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(p: OrderProps) {
    this._id = p.id || UUIDv7.generate();
    this._orderNumber = p.orderNumber || OrderNumber.generate();
    this._orderType = p.orderType;
    this._customerId = p.customerId;
    this._customerSnapshot = p.customerSnapshot;
    this._items = p.items;
    this._subtotal = p.subtotal;
    this._discount = p.discount || Money.zero();
    this._total = p.total;
    this._paymentMethod = p.paymentMethod;
    this._deliveryMethod = p.deliveryMethod;
    this._deliveryAddress = p.deliveryAddress;
    this._status = p.status || OrderStatus.PENDING;
    this._notes = p.notes;
    this._createdAt = p.createdAt || new Date();
    this._updatedAt = p.updatedAt || new Date();
  }

  public get id(): UUIDv7 { return this._id; }
  public get orderNumber(): OrderNumber { return this._orderNumber; }
  public get orderType(): OrderType { return this._orderType; }
  public get customerId(): UUIDv7 { return this._customerId; }
  public get customerSnapshot(): CustomerSnapshotDto { return this._customerSnapshot; }
  public get items(): OrderItemDto[] { return this._items; }
  public get subtotal(): Money { return this._subtotal; }
  public get discount(): Money { return this._discount; }
  public get total(): Money { return this._total; }
  public get paymentMethod(): PaymentMethod { return this._paymentMethod; }
  public get deliveryMethod(): DeliveryMethod { return this._deliveryMethod; }
  public get deliveryAddress(): string | undefined { return this._deliveryAddress; }
  public get status(): OrderStatus { return this._status; }
  public get notes(): string | undefined { return this._notes; }
  public get createdAt(): Date { return this._createdAt; }
  public get updatedAt(): Date { return this._updatedAt; }

  public updateStatus(newStatus: OrderStatus, notes?: string): void {
    this._status = newStatus;
    if (notes) this._notes = notes;
    this._updatedAt = new Date();
  }
}
