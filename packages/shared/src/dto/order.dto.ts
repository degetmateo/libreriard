import { OrderStatus, OrderType, PaymentMethod, DeliveryMethod } from '../enums';

export interface OrderItemDto {
  productId: string;
  productName: string;
  subTypeId?: string;
  subTypeName?: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

export interface CustomerSnapshotDto {
  customerId: string;
  name: string;
  cuitCuil: string;
  email: string;
  phone?: string;
  address?: string;
  postalCode?: string;
}

export interface OrderDto {
  id: string;
  orderNumber: string;
  orderType: OrderType;
  customer: CustomerSnapshotDto;
  items: OrderItemDto[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  status: OrderStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemInput {
  productId: string;
  subTypeId?: string;
  quantity: number;
}

export interface CreateOrderDto {
  items: CreateOrderItemInput[];
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  notes?: string;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  notes?: string;
}
