import { Product } from '../../../domain/entities/product.entity';
import { Money } from '../../../domain/value-objects/money.vo';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { ProductDto } from '@libreriard/shared';
import { Document } from 'mongodb';

export class ProductMapper {
  public static toDomain(doc: Document): Product {
    return new Product({
      id: BsonUuidHelper.fromBsonUuid(doc._id),
      name: doc.name,
      description: doc.description,
      barcode: doc.barcode,
      retailPrice: Money.from(doc.retailPrice),
      wholesalePrice: Money.from(doc.wholesalePrice),
      images: doc.images || [],
      subTypes: doc.subTypes || [],
      supplier: doc.supplier,
      categories: doc.categories || [],
      tags: doc.tags || [],
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  public static toPersistence(entity: Product): Document {
    return {
      _id: BsonUuidHelper.toBsonUuid(entity.id),
      name: entity.name,
      description: entity.description,
      barcode: entity.barcode,
      retailPrice: entity.retailPrice.getAmount(),
      wholesalePrice: entity.wholesalePrice.getAmount(),
      images: entity.images,
      subTypes: entity.subTypes,
      supplier: entity.supplier,
      categories: entity.categories,
      tags: entity.tags,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt
    };
  }

  public static toDto(entity: Product): ProductDto {
    return {
      id: entity.id.toString(),
      name: entity.name,
      description: entity.description,
      barcode: entity.barcode,
      retailPrice: entity.retailPrice.getAmount(),
      wholesalePrice: entity.wholesalePrice.getAmount(),
      images: entity.images,
      subTypes: entity.subTypes,
      supplier: entity.supplier,
      categories: entity.categories,
      tags: entity.tags,
      isActive: entity.isActive,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString()
    };
  }
}
