import { UUIDv7 } from '../value-objects/uuid-v7.vo';
import { Money } from '../value-objects/money.vo';
import { ProductImageDto, ProductVariantDto, RetailPriceTier } from '@libreriard/shared';

export interface ProductProps {
  id?: UUIDv7;
  name: string;
  description?: string;
  barcode?: string;
  retailPrice?: Money | null;
  wholesalePrice?: Money | null;
  retailPriceTiers?: RetailPriceTier[];
  images?: ProductImageDto[];
  subTypes?: ProductVariantDto[];
  supplier?: string;
  categories?: string[];
  tags?: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Product {
  private readonly _id: UUIDv7;
  private _name: string;
  private _description: string;
  private _barcode?: string;
  private _retailPrice?: Money | null;
  private _wholesalePrice?: Money | null;
  private _retailPriceTiers: RetailPriceTier[];
  private _images: ProductImageDto[];
  private _subTypes: ProductVariantDto[];
  private _supplier: string;
  private _categories: string[];
  private _tags: string[];
  private _isActive: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  constructor(p: ProductProps) {
    this._id = p.id || UUIDv7.generate();
    this._name = p.name;
    this._description = p.description || '';
    this._barcode = p.barcode?.trim() || undefined;
    this._retailPrice = p.retailPrice !== undefined ? p.retailPrice : null;
    this._wholesalePrice = p.wholesalePrice !== undefined ? p.wholesalePrice : null;
    this._retailPriceTiers = p.retailPriceTiers || [];
    this._images = p.images || [];
    this._subTypes = p.subTypes || [];
    this._supplier = p.supplier || '';
    this._categories = p.categories || [];
    this._tags = p.tags || [];
    this._isActive = p.isActive !== undefined ? p.isActive : true;
    this._createdAt = p.createdAt || new Date();
    this._updatedAt = p.updatedAt || new Date();
  }

  public get id(): UUIDv7 { return this._id; }
  public get name(): string { return this._name; }
  public get description(): string { return this._description; }
  public get barcode(): string | undefined { return this._barcode; }
  public get retailPrice(): Money | null | undefined { return this._retailPrice; }
  public get wholesalePrice(): Money | null | undefined { return this._wholesalePrice; }
  public get retailPriceTiers(): RetailPriceTier[] { return this._retailPriceTiers; }
  public get images(): ProductImageDto[] { return this._images; }
  public get subTypes(): ProductVariantDto[] { return this._subTypes; }
  public get supplier(): string { return this._supplier; }
  public get categories(): string[] { return this._categories; }
  public get tags(): string[] { return this._tags; }
  public get isActive(): boolean { return this._isActive; }
  public get createdAt(): Date { return this._createdAt; }
  public get updatedAt(): Date { return this._updatedAt; }

  public toggleActive(active?: boolean): void {
    this._isActive = active !== undefined ? active : !this._isActive;
    this._updatedAt = new Date();
  }

  public calculateRetailUnitPrice(quantity: number): { unitPrice: number; originalUnitPrice: number; discountApplied: boolean } | null {
    if (!this._retailPrice) return null;
    const base = this._retailPrice.getAmount();
    if (!this._retailPriceTiers || this._retailPriceTiers.length === 0) {
      return { unitPrice: base, originalUnitPrice: base, discountApplied: false };
    }
    const matchingTiers = [...this._retailPriceTiers]
      .filter((t) => t.minQuantity <= quantity)
      .sort((a, b) => b.minQuantity - a.minQuantity);

    if (matchingTiers.length > 0 && matchingTiers[0].unitPrice < base) {
      return { unitPrice: matchingTiers[0].unitPrice, originalUnitPrice: base, discountApplied: true };
    }
    return { unitPrice: base, originalUnitPrice: base, discountApplied: false };
  }

  public updateDetails(updates: Partial<ProductProps>): void {
    if (updates.name !== undefined) this._name = updates.name;
    if (updates.description !== undefined) this._description = updates.description;
    if (updates.barcode !== undefined) this._barcode = updates.barcode?.trim() || undefined;
    if (updates.retailPrice !== undefined) this._retailPrice = updates.retailPrice;
    if (updates.wholesalePrice !== undefined) this._wholesalePrice = updates.wholesalePrice;
    if (updates.retailPriceTiers !== undefined) this._retailPriceTiers = updates.retailPriceTiers;
    if (updates.images !== undefined) this._images = updates.images;
    if (updates.subTypes !== undefined) this._subTypes = updates.subTypes;
    if (updates.supplier !== undefined) this._supplier = updates.supplier;
    if (updates.categories !== undefined) this._categories = updates.categories;
    if (updates.tags !== undefined) this._tags = updates.tags;
    if (updates.isActive !== undefined) this._isActive = updates.isActive;
    this._updatedAt = new Date();
  }
}
