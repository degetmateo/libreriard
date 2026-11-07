import { PriceHistory } from '../../../domain/entities/price-history.entity';
import { BsonUuidHelper } from '../bson-uuid.helper';
import { PriceHistoryDto } from '@libreriard/shared';
import { Document } from 'mongodb';

export class PriceHistoryMapper {
  public static toDomain(doc: Document): PriceHistory {
    return new PriceHistory({
      id: BsonUuidHelper.fromBsonUuid(doc._id),
      productId: BsonUuidHelper.fromBsonUuid(doc.productId),
      productName: doc.productName,
      priceType: doc.priceType,
      oldPrice: doc.oldPrice !== undefined ? doc.oldPrice : null,
      newPrice: doc.newPrice !== undefined ? doc.newPrice : null,
      diffAmount: doc.diffAmount || 0,
      diffPercentage: doc.diffPercentage || 0,
      changedBy: doc.changedBy,
      source: doc.source || 'MANUAL_EDIT',
      createdAt: doc.createdAt
    });
  }

  public static toPersistence(entity: PriceHistory): Document {
    return {
      _id: BsonUuidHelper.toBsonUuid(entity.id),
      productId: BsonUuidHelper.toBsonUuid(entity.productId),
      productName: entity.productName,
      priceType: entity.priceType,
      oldPrice: entity.oldPrice,
      newPrice: entity.newPrice,
      diffAmount: entity.diffAmount,
      diffPercentage: entity.diffPercentage,
      changedBy: entity.changedBy,
      source: entity.source,
      createdAt: entity.createdAt
    };
  }

  public static toDto(entity: PriceHistory): PriceHistoryDto {
    return {
      id: entity.id.toString(),
      productId: entity.productId.toString(),
      productName: entity.productName,
      priceType: entity.priceType,
      oldPrice: entity.oldPrice,
      newPrice: entity.newPrice,
      diffAmount: entity.diffAmount,
      diffPercentage: entity.diffPercentage,
      changedBy: entity.changedBy,
      source: entity.source,
      createdAt: entity.createdAt.toISOString()
    };
  }
}

