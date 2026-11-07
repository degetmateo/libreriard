export interface ProductImageDto {
  url: string;
  publicId?: string;
  isPrimary: boolean;
}

export interface RetailPriceTier {
  minQuantity: number;
  unitPrice: number;
}

export interface ProductVariantDto {
  id: string;
  name: string;
  sku?: string;
  priceModifier: number;
  barcode?: string;
}

export interface ProductDto {
  id: string;
  name: string;
  description?: string;
  barcode?: string;
  retailPrice?: number | null;
  wholesalePrice?: number | null;
  retailPriceTiers?: RetailPriceTier[];
  images: ProductImageDto[];
  subTypes: ProductVariantDto[];
  supplier?: string;
  categories: string[];
  tags: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  description?: string;
  barcode?: string;
  retailPrice?: number | null;
  wholesalePrice?: number | null;
  retailPriceTiers?: RetailPriceTier[];
  images?: ProductImageDto[];
  subTypes?: ProductVariantDto[];
  supplier?: string;
  categories?: string[];
  tags?: string[];
  isActive?: boolean;
}

export interface UpdateProductDto extends Partial<CreateProductDto> { }
