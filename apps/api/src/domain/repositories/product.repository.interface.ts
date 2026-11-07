import { Product } from '../entities/product.entity';
import { UUIDv7 } from '../value-objects/uuid-v7.vo';

export interface ProductFilterParams {
  search?: string;
  category?: string;
  tag?: string;
  barcode?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface IProductRepository {
  findById(id: UUIDv7): Promise<Product | null>;
  findByBarcode(barcode: string): Promise<Product | null>;
  findMany(params: ProductFilterParams): Promise<{ items: Product[]; total: number }>;
  save(product: Product): Promise<void>;
  saveMany(products: Product[]): Promise<void>;
  delete(id: UUIDv7): Promise<void>;
}

