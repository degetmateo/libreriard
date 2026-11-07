import { Product } from '../entities/product.entity';
import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { Money } from '../value-objects/money.vo';
import { CreateProductDto } from '@libreriard/shared';

export class ProductFactory {
  public static create(dto: CreateProductDto): Product {
    return new Product({
      id: UUIDv7.generate(),
      name: dto.name.trim(),
      description: dto.description.trim(),
      barcode: dto.barcode.trim(),
      retailPrice: Money.from(dto.retailPrice),
      wholesalePrice: Money.from(dto.wholesalePrice),
      images: dto.images || [],
      subTypes: dto.subTypes || [],
      supplier: dto.supplier.trim(),
      categories: dto.categories.map(c => c.trim()).filter(Boolean),
      tags: dto.tags.map(t => t.trim().toLowerCase()).filter(Boolean),
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdAt: new Date(),
      updatedAt: new Date()
    });
  }
}
