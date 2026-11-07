import { z } from 'zod';
import { PaymentMethod, DeliveryMethod, OrderStatus } from '@libreriard/shared';

export const createOrderItemSchema = z.object({
  productId: z.string().min(1, 'El ID de producto es obligatorio.'),
  subTypeId: z.string().optional(),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1.')
});

export const createOrderSchema = z.object({
  items: z.array(createOrderItemSchema).min(1, 'Debe incluir al menos un producto en la orden.'),
  paymentMethod: z.nativeEnum(PaymentMethod),
  deliveryMethod: z.nativeEnum(DeliveryMethod),
  deliveryAddress: z.string().optional(),
  notes: z.string().optional()
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
  notes: z.string().optional()
});
