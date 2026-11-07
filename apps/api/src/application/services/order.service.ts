import { IOrderRepository, OrderFilterParams } from '../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ICustomerUserRepository } from '../../domain/repositories/customer-user.repository.interface';
import { ISystemSettingsRepository } from '../../domain/repositories/system-settings.repository.interface';
import { IEmailService } from '../../infrastructure/email/email-service.interface';
import { OrderFactory } from '../../domain/factories/order.factory';
import { OrderMapper } from '../../infrastructure/database/mappers/order.mapper';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.vo';
import { CreateOrderDto, OrderDto, OrderStatus, OrderType, OrderItemDto } from '@libreriard/shared';

export class OrderService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly productRepo: IProductRepository,
    private readonly customerRepo: ICustomerUserRepository,
    private readonly settingsRepo: ISystemSettingsRepository,
    private readonly emailService: IEmailService
  ) {}

  public async createOrder(customerIdStr: string, dto: CreateOrderDto): Promise<OrderDto> {
    const customerId = UUIDv7.fromString(customerIdStr);
    const customer = await this.customerRepo.findById(customerId);
    if (!customer) throw new Error('Cliente no encontrado.');

    const orderType = customer.isWholesaleApproved ? OrderType.WHOLESALE : OrderType.RETAIL;
    const items: OrderItemDto[] = [];

    for (const itemInput of dto.items) {
      const product = await this.productRepo.findById(UUIDv7.fromString(itemInput.productId));
      if (!product || !product.isActive) {
        throw new Error(`Producto no disponible: ${itemInput.productId}`);
      }

      let unitPrice = orderType === OrderType.WHOLESALE ? product.wholesalePrice.getAmount() : product.retailPrice.getAmount();
      let subTypeName: string | undefined;

      if (itemInput.subTypeId) {
        const variant = product.subTypes.find(v => v.id === itemInput.subTypeId);
        if (variant) {
          unitPrice += variant.priceModifier || 0;
          subTypeName = variant.name;
        }
      }

      const subtotal = Math.round(unitPrice * itemInput.quantity * 100) / 100;
      items.push({
        productId: product.id.toString(),
        productName: product.name,
        subTypeId: itemInput.subTypeId,
        subTypeName,
        unitPrice,
        quantity: itemInput.quantity,
        subtotal
      });
    }

    const order = OrderFactory.create({
      customerId,
      customerSnapshot: {
        customerId: customer.id.toString(),
        name: customer.name,
        cuitCuil: customer.cuitCuil,
        email: customer.email.toValue(),
        phone: customer.phone,
        address: customer.address,
        postalCode: customer.postalCode
      },
      orderType,
      items,
      paymentMethod: dto.paymentMethod,
      deliveryMethod: dto.deliveryMethod,
      deliveryAddress: dto.deliveryAddress || customer.address,
      notes: dto.notes
    });

    await this.orderRepo.save(order);
    const orderDto = OrderMapper.toDto(order);

    const settings = await this.settingsRepo.getSettings();
    await this.emailService.sendOrderConfirmationEmail(orderDto, settings.bankTransferDetails);

    return orderDto;
  }

  public async getOrders(params: OrderFilterParams): Promise<{ items: OrderDto[]; total: number }> {
    const result = await this.orderRepo.findMany(params);
    return {
      items: result.items.map(o => OrderMapper.toDto(o)),
      total: result.total
    };
  }

  public async updateOrderStatus(idStr: string, status: OrderStatus, notes?: string): Promise<OrderDto> {
    const order = await this.orderRepo.findById(UUIDv7.fromString(idStr));
    if (!order) throw new Error('Orden no encontrada.');

    order.updateStatus(status, notes);
    await this.orderRepo.save(order);
    return OrderMapper.toDto(order);
  }
}
