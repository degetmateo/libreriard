import { PriceHistory } from '../entities/price-history.entity';
import { UUIDv7 } from '../value-objects/uuid-v7.vo';

export interface IPriceHistoryRepository {
  save(entry: PriceHistory): Promise<void>;
  saveMany(entries: PriceHistory[]): Promise<void>;
  findByProductId(productId: UUIDv7, page?: number, limit?: number): Promise<{ items: PriceHistory[]; total: number }>;
  findAll(page?: number, limit?: number): Promise<{ items: PriceHistory[]; total: number }>;
}

