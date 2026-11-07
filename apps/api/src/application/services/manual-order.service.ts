import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ICustomerUserRepository } from '../../domain/repositories/customer-user.repository.interface';
import { OrderFactory } from '../../domain/factories/order.factory';
import { ProductFactory } from '../../domain/factories/product.factory';
import { OrderMapper } from '../../infrastructure/database/mappers/order.mapper';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.vo';
import { Money } from '../../domain/value-objects/money.vo';
import {
  CreateManualOrderDto,
  OrderDto,
  OrderType,
  OrderStatus,
  OrderItemDto,
  CustomerSnapshotDto
} from '@libreriard/shared';

import { PriceHistoryService } from './price-history.service';

export class ManualOrderService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly productRepo: IProductRepository,
    private readonly customerRepo: ICustomerUserRepository,
    private readonly priceHistoryService?: PriceHistoryService
  ) {}

  public async createManualOrder(staffUserId: string, dto: CreateManualOrderDto): Promise<OrderDto> {
    if (!dto.items || dto.items.length === 0) {
      throw new Error('La orden debe contener al menos un producto.');
    }

    const items: OrderItemDto[] = [];

    for (const itemInput of dto.items) {
      let productIdStr = itemInput.productId;
      const unitPrice = Number(itemInput.unitPrice) || 0;
      const quantity = Math.max(1, Number(itemInput.quantity) || 1);

      if (productIdStr) {
        const existing = await this.productRepo.findById(UUIDv7.fromString(productIdStr));
        if (existing) {
          if (itemInput.updatePriceInDb) {
            const isWholesale = dto.orderType === OrderType.WHOLESALE;
            const oldPrice = isWholesale ? existing.wholesalePrice?.getAmount() ?? null : existing.retailPrice?.getAmount() ?? null;
            if (isWholesale) {
              existing.updateDetails({ wholesalePrice: Money.from(unitPrice) });
            } else {
              existing.updateDetails({ retailPrice: Money.from(unitPrice) });
            }
            await this.productRepo.save(existing);

            if (this.priceHistoryService) {
              await this.priceHistoryService.recordChange({
                productId: existing.id,
                productName: existing.name,
                priceType: isWholesale ? 'WHOLESALE' : 'RETAIL',
                oldPrice,
                newPrice: unitPrice,
                source: 'MANUAL_ORDER'
              });
            }
          }
        } else if (itemInput.addToDb) {
          const newProd = this.createAndSaveProduct(itemInput.productName, unitPrice, dto.orderType);
          productIdStr = (await newProd).id.toString();
        }
      } else if (itemInput.addToDb) {
        const newProd = await this.createAndSaveProduct(itemInput.productName, unitPrice, dto.orderType);
        productIdStr = newProd.id.toString();
      } else {
        productIdStr = UUIDv7.generate().toString();
      }

      const subtotal = Math.round(unitPrice * quantity * 100) / 100;
      items.push({
        productId: productIdStr,
        productName: itemInput.productName.trim() || 'Producto sin nombre',
        subTypeId: itemInput.subTypeId,
        unitPrice,
        originalUnitPrice: itemInput.originalUnitPrice || unitPrice,
        discountApplied: Boolean(itemInput.discountApplied),
        quantity,
        subtotal
      });
    }

    const customerSnapshot = await this.resolveCustomerSnapshot(dto.customer);
    const customerId = customerSnapshot.customerId ? UUIDv7.fromString(customerSnapshot.customerId) : UUIDv7.generate();

    const order = OrderFactory.create({
      customerId,
      customerSnapshot,
      orderType: dto.orderType,
      items,
      advancePayment: dto.advancePayment ? Math.max(0, Number(dto.advancePayment)) : 0,
      paymentMethod: dto.paymentMethod,
      deliveryMethod: dto.deliveryMethod,
      deliveryAddress: dto.deliveryAddress,
      status: OrderStatus.CONFIRMED,
      notes: dto.notes
    });

    await this.orderRepo.save(order);
    return OrderMapper.toDto(order);
  }

  private async createAndSaveProduct(name: string, price: number, orderType: OrderType) {
    const product = ProductFactory.create({
      name: name.trim() || 'Nuevo Producto',
      retailPrice: orderType === OrderType.RETAIL ? price : null,
      wholesalePrice: orderType === OrderType.WHOLESALE ? price : null
    });
    await this.productRepo.save(product);
    return product;
  }

  private async resolveCustomerSnapshot(input?: CreateManualOrderDto['customer']): Promise<CustomerSnapshotDto> {
    if (input?.customerId) {
      const cust = await this.customerRepo.findById(UUIDv7.fromString(input.customerId));
      if (cust) {
        return {
          customerId: cust.id.toString(),
          name: cust.name,
          cuitCuil: cust.cuitCuil,
          email: cust.email.toValue(),
          phone: cust.phone,
          address: cust.address,
          postalCode: cust.postalCode
        };
      }
    }

    return {
      customerId: input?.customerId || UUIDv7.generate().toString(),
      name: input?.name?.trim() || 'Consumidor Final',
      cuitCuil: input?.cuitCuil?.trim() || '',
      email: input?.email?.trim() || '',
      phone: input?.phone?.trim() || '',
      address: input?.address?.trim() || '',
      postalCode: input?.postalCode?.trim() || ''
    };
  }
}

