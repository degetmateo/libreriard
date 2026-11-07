import { IPriceHistoryRepository } from '../../domain/repositories/price-history.repository.interface';
import { PriceHistory } from '../../domain/entities/price-history.entity';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.vo';
import { PriceHistoryMapper } from '../../infrastructure/database/mappers/price-history.mapper';
import { PriceHistoryDto } from '@libreriard/shared';

export interface RecordPriceChangeParams {
  productId: UUIDv7;
  productName: string;
  priceType: 'RETAIL' | 'WHOLESALE';
  oldPrice: number | null;
  newPrice: number | null;
  changedBy?: {
    id: string;
    name: string;
    email: string;
  };
  source: string;
}

export class PriceHistoryService {
  constructor(private readonly priceHistoryRepo: IPriceHistoryRepository) {}

  public async recordChange(params: RecordPriceChangeParams): Promise<void> {
    if (params.oldPrice === params.newPrice) return;

    const oldP = params.oldPrice ?? 0;
    const newP = params.newPrice ?? 0;
    const diffAmount = Math.round((newP - oldP) * 100) / 100;
    let diffPercentage = 0;

    if (oldP > 0) {
      diffPercentage = Math.round(((newP - oldP) / oldP) * 10000) / 100;
    } else if (newP > 0) {
      diffPercentage = 100;
    }

    const entry = new PriceHistory({
      productId: params.productId,
      productName: params.productName,
      priceType: params.priceType,
      oldPrice: params.oldPrice,
      newPrice: params.newPrice,
      diffAmount,
      diffPercentage,
      changedBy: params.changedBy,
      source: params.source
    });

    await this.priceHistoryRepo.save(entry);
  }

  public async getProductPriceHistory(
    productIdStr: string,
    page = 1,
    limit = 20
  ): Promise<{ items: PriceHistoryDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const productId = UUIDv7.fromString(productIdStr);
    const { items, total } = await this.priceHistoryRepo.findByProductId(productId, page, limit);

    return {
      items: items.map((i) => PriceHistoryMapper.toDto(i)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }

  public async getAllPriceHistory(
    page = 1,
    limit = 20
  ): Promise<{ items: PriceHistoryDto[]; total: number; page: number; limit: number; totalPages: number }> {
    const { items, total } = await this.priceHistoryRepo.findAll(page, limit);

    return {
      items: items.map((i) => PriceHistoryMapper.toDto(i)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1
    };
  }
}

