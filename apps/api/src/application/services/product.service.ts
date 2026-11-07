import { IProductRepository, ProductFilterParams } from '../../domain/repositories/product.repository.interface';
import { ProductFactory } from '../../domain/factories/product.factory';
import { ProductMapper } from '../../infrastructure/database/mappers/product.mapper';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.vo';
import { Money } from '../../domain/value-objects/money.vo';
import { CreateProductDto, UpdateProductDto, ProductDto } from '@libreriard/shared';

export class ProductService {
  constructor(private readonly productRepo: IProductRepository) {}

  public async getProducts(params: ProductFilterParams): Promise<{ items: ProductDto[]; total: number }> {
    const result = await this.productRepo.findMany(params);
    return { items: result.items.map(p => ProductMapper.toDto(p)), total: result.total };
  }

  public async getProductById(idStr: string): Promise<ProductDto> {
    const product = await this.productRepo.findById(UUIDv7.fromString(idStr));
    if (!product) throw new Error('Producto no encontrado.');
    return ProductMapper.toDto(product);
  }

  public async createProduct(dto: CreateProductDto): Promise<ProductDto> {
    if (dto.barcode && dto.barcode.trim()) {
      const existing = await this.productRepo.findByBarcode(dto.barcode.trim());
      if (existing) throw new Error(`Ya existe un producto con el código de barras: ${dto.barcode}`);
    }
    const product = ProductFactory.create(dto);
    await this.productRepo.save(product);
    return ProductMapper.toDto(product);
  }

  public async updateProduct(idStr: string, dto: UpdateProductDto): Promise<ProductDto> {
    const product = await this.productRepo.findById(UUIDv7.fromString(idStr));
    if (!product) throw new Error('Producto no encontrado.');

    if (dto.barcode && dto.barcode.trim() && dto.barcode.trim() !== product.barcode) {
      const existing = await this.productRepo.findByBarcode(dto.barcode.trim());
      if (existing && !existing.id.equals(product.id)) {
        throw new Error(`Ya existe otro producto con el código de barras: ${dto.barcode}`);
      }
    }

    product.updateDetails({
      name: dto.name,
      description: dto.description,
      barcode: dto.barcode !== undefined ? dto.barcode : product.barcode,
      retailPrice: (dto.retailPrice !== undefined && dto.retailPrice !== null) ? Money.from(dto.retailPrice) : dto.retailPrice === null ? null : product.retailPrice,
      wholesalePrice: (dto.wholesalePrice !== undefined && dto.wholesalePrice !== null) ? Money.from(dto.wholesalePrice) : dto.wholesalePrice === null ? null : product.wholesalePrice,
      retailPriceTiers: dto.retailPriceTiers !== undefined ? dto.retailPriceTiers : product.retailPriceTiers,
      images: dto.images,
      subTypes: dto.subTypes,
      supplier: dto.supplier,
      categories: dto.categories,
      tags: dto.tags,
      isActive: dto.isActive
    });

    await this.productRepo.save(product);
    return ProductMapper.toDto(product);
  }

  public async toggleProductActive(idStr: string): Promise<ProductDto> {
    const product = await this.productRepo.findById(UUIDv7.fromString(idStr));
    if (!product) throw new Error('Producto no encontrado.');
    product.toggleActive();
    await this.productRepo.save(product);
    return ProductMapper.toDto(product);
  }

  public async deleteProduct(idStr: string): Promise<void> {
    const id = UUIDv7.fromString(idStr);
    const product = await this.productRepo.findById(id);
    if (!product) throw new Error('Producto no encontrado.');
    await this.productRepo.delete(id);
  }
}
