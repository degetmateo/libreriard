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
      description: doc.description || '',
      barcode: doc.barcode,
      retailPrice: (doc.retailPrice !== undefined && doc.retailPrice !== null) ? Money.from(doc.retailPrice) : null,
      wholesalePrice: (doc.wholesalePrice !== undefined && doc.wholesalePrice !== null) ? Money.from(doc.wholesalePrice) : null,
      retailPriceTiers: doc.retailPriceTiers || [],
      images: doc.images || [],
      subTypes: doc.subTypes || [],
      supplier: doc.supplier || '',
      categories: doc.categories || [],
      tags: doc.tags || [],
      isActive: doc.isActive !== undefined ? doc.isActive : true,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  public static toPersistence(entity: Product): Document {
    return {
      _id: BsonUuidHelper.toBsonUuid(entity.id),
      name: entity.name,
      description: entity.description,
      barcode: entity.barcode || null,
      retailPrice: entity.retailPrice ? entity.retailPrice.getAmount() : null,
      wholesalePrice: entity.wholesalePrice ? entity.wholesalePrice.getAmount() : null,
      retailPriceTiers: entity.retailPriceTiers,
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
      retailPrice: entity.retailPrice ? entity.retailPrice.getAmount() : null,
      wholesalePrice: entity.wholesalePrice ? entity.wholesalePrice.getAmount() : null,
      retailPriceTiers: entity.retailPriceTiers,
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
