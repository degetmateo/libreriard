import * as XLSX from 'xlsx';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ProductFactory } from '../../domain/factories/product.factory';
import { Product } from '../../domain/entities/product.entity';
import { UUIDv7 } from '../../domain/value-objects/uuid-v7.vo';
import { Money } from '../../domain/value-objects/money.vo';

import { PriceHistoryService } from './price-history.service';

export class ProductExcelService {
  constructor(
    private readonly productRepo: IProductRepository,
    private readonly priceHistoryService?: PriceHistoryService
  ) {}

  public async exportProductsToExcel(): Promise<Buffer> {
    const { items: products } = await this.productRepo.findMany({ limit: 100000 });
    const rows = products.map((p) => ({
      ID: p.id.toString(),
      'Código de Barras': p.barcode || '',
      Nombre: p.name,
      Descripción: p.description || '',
      'Precio Minorista': p.retailPrice ? p.retailPrice.getAmount() : '',
      'Precio Mayorista': p.wholesalePrice ? p.wholesalePrice.getAmount() : '',
      Proveedor: p.supplier || '',
      Categorías: (p.categories || []).join(', '),
      Etiquetas: (p.tags || []).join(', '),
      Activo: p.isActive ? 'SI' : 'NO'
    }));

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  public async exportCustomerPriceList(isWholesale: boolean): Promise<Buffer> {
    const { items: products } = await this.productRepo.findMany({ isActive: true, limit: 100000 });
    const eligible = products.filter((p) => (isWholesale ? p.wholesalePrice && p.wholesalePrice.getAmount() > 0 : p.retailPrice && p.retailPrice.getAmount() > 0));

    const rows = eligible.map((p) => {
      const baseRow: Record<string, string | number> = {
        'Código de Barras': p.barcode || 'S/C',
        Producto: p.name,
        Descripción: p.description || '',
        Proveedor: p.supplier || '',
        Categorías: (p.categories || []).join(', ')
      };
      if (isWholesale) {
        baseRow['Precio Mayorista ($)'] = p.wholesalePrice!.getAmount();
      } else {
        baseRow['Precio Minorista ($)'] = p.retailPrice!.getAmount();
      }
      return baseRow;
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, isWholesale ? 'Lista Mayorista' : 'Lista Minorista');
    return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  }

  public async importProductsFromExcel(buffer: Buffer): Promise<{ total: number; created: number; updated: number; errors: string[] }> {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = wb.SheetNames[0];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, any>>(wb.Sheets[sheetName]);

    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i];
      const rowNum = i + 2;
      const name = String(row['Nombre'] || row['name'] || '').trim();
      if (!name) {
        errors.push(`Fila ${rowNum}: Nombre del producto obligatorio.`);
        continue;
      }

      const idStr = String(row['ID'] || row['id'] || '').trim();
      const barcode = String(row['Código de Barras'] || row['barcode'] || '').trim() || undefined;
      const retailPriceNum = row['Precio Minorista'] !== undefined && row['Precio Minorista'] !== '' ? Number(row['Precio Minorista']) : null;
      const wholesalePriceNum = row['Precio Mayorista'] !== undefined && row['Precio Mayorista'] !== '' ? Number(row['Precio Mayorista']) : null;
      const supplier = String(row['Proveedor'] || row['supplier'] || '').trim();
      const desc = String(row['Descripción'] || row['description'] || '').trim();
      const activeVal = String(row['Activo'] || row['isActive'] || 'SI').trim().toUpperCase();
      const isActive = activeVal === 'SI' || activeVal === 'TRUE' || activeVal === '1';

      const categories = row['Categorías'] ? String(row['Categorías']).split(',').map((s) => s.trim()).filter(Boolean) : [];
      const tags = row['Etiquetas'] ? String(row['Etiquetas']).split(',').map((s) => s.trim()).filter(Boolean) : [];

      try {
        let existing: Product | null = null;
        if (idStr) {
          try { existing = await this.productRepo.findById(UUIDv7.fromString(idStr)); } catch {}
        }
        if (!existing && barcode) {
          existing = await this.productRepo.findByBarcode(barcode);
        }

        if (existing) {
          const oldRetail = existing.retailPrice?.getAmount() ?? null;
          const oldWholesale = existing.wholesalePrice?.getAmount() ?? null;
          if (this.priceHistoryService) {
            if (retailPriceNum !== null && retailPriceNum !== oldRetail) {
              await this.priceHistoryService.recordChange({
                productId: existing.id,
                productName: name,
                priceType: 'RETAIL',
                oldPrice: oldRetail,
                newPrice: retailPriceNum,
                source: 'EXCEL_IMPORT'
              });
            }
            if (wholesalePriceNum !== null && wholesalePriceNum !== oldWholesale) {
              await this.priceHistoryService.recordChange({
                productId: existing.id,
                productName: name,
                priceType: 'WHOLESALE',
                oldPrice: oldWholesale,
                newPrice: wholesalePriceNum,
                source: 'EXCEL_IMPORT'
              });
            }
          }

          existing.updateDetails({
            name,
            description: desc,
            barcode,
            supplier,
            categories,
            tags,
            retailPrice: retailPriceNum !== null ? Money.from(retailPriceNum) : null,
            wholesalePrice: wholesalePriceNum !== null ? Money.from(wholesalePriceNum) : null
          });
          existing.toggleActive(isActive);
          await this.productRepo.save(existing);
          updated++;
        } else {
          const newProd = ProductFactory.create({
            id: idStr ? UUIDv7.fromString(idStr) : undefined,
            name,
            description: desc,
            barcode,
            supplier,
            categories,
            tags,
            retailPrice: retailPriceNum,
            wholesalePrice: wholesalePriceNum
          });
          newProd.toggleActive(isActive);
          await this.productRepo.save(newProd);
          created++;
        }
      } catch (err: any) {
        errors.push(`Fila ${rowNum}: ${err?.message || 'Error al procesar fila'}`);
      }
    }

    return { total: rawRows.length, created, updated, errors };
  }

  public async importMassiveProducts(items: any[]): Promise<{ total: number; inserted: number; updated: number; errors: string[] }> {
    let inserted = 0;
    let updated = 0;
    const errors: string[] = [];
    const productsToSave: Product[] = [];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const name = String(item.name || '').trim();
      if (!name) {
        errors.push(`Ítem ${i + 1}: El nombre es obligatorio.`);
        continue;
      }

      try {
        let existing: Product | null = null;
        if (item.id) {
          try { existing = await this.productRepo.findById(UUIDv7.fromString(item.id)); } catch {}
        }
        if (!existing && item.barcode) {
          existing = await this.productRepo.findByBarcode(String(item.barcode).trim());
        }

        const retailNum = item.retailPrice !== undefined && item.retailPrice !== null ? Number(item.retailPrice) : null;
        const wholesaleNum = item.wholesalePrice !== undefined && item.wholesalePrice !== null ? Number(item.wholesalePrice) : null;

        if (existing) {
          const oldRetail = existing.retailPrice?.getAmount() ?? null;
          const oldWholesale = existing.wholesalePrice?.getAmount() ?? null;
          if (this.priceHistoryService) {
            if (retailNum !== null && retailNum !== oldRetail) {
              await this.priceHistoryService.recordChange({
                productId: existing.id,
                productName: name,
                priceType: 'RETAIL',
                oldPrice: oldRetail,
                newPrice: retailNum,
                source: 'MASSIVE_IMPORT'
              });
            }
            if (wholesaleNum !== null && wholesaleNum !== oldWholesale) {
              await this.priceHistoryService.recordChange({
                productId: existing.id,
                productName: name,
                priceType: 'WHOLESALE',
                oldPrice: oldWholesale,
                newPrice: wholesaleNum,
                source: 'MASSIVE_IMPORT'
              });
            }
          }

          existing.updateDetails({
            name,
            description: item.description,
            barcode: item.barcode?.trim(),
            retailPrice: retailNum !== null ? Money.from(retailNum) : null,
            wholesalePrice: wholesaleNum !== null ? Money.from(wholesaleNum) : null,
            supplier: item.supplier,
            categories: Array.isArray(item.categories) ? item.categories : [],
            tags: Array.isArray(item.tags) ? item.tags : [],
            retailPriceTiers: Array.isArray(item.retailPriceTiers) ? item.retailPriceTiers : undefined,
            subTypes: Array.isArray(item.subTypes) ? item.subTypes : undefined
          });
          if (item.isActive !== undefined) existing.toggleActive(Boolean(item.isActive));
          productsToSave.push(existing);
          updated++;
        } else {
          const product = ProductFactory.create({
            id: item.id ? UUIDv7.fromString(item.id) : undefined,
            name,
            description: item.description,
            barcode: item.barcode?.trim(),
            retailPrice: retailNum,
            wholesalePrice: wholesaleNum,
            supplier: item.supplier,
            categories: Array.isArray(item.categories) ? item.categories : [],
            tags: Array.isArray(item.tags) ? item.tags : [],
            retailPriceTiers: Array.isArray(item.retailPriceTiers) ? item.retailPriceTiers : [],
            subTypes: Array.isArray(item.subTypes) ? item.subTypes : []
          });
          if (item.isActive !== undefined) product.toggleActive(Boolean(item.isActive));
          productsToSave.push(product);
          inserted++;
        }
      } catch (err: any) {
        errors.push(`Ítem ${i + 1} ("${name}"): ${err?.message || 'Error al procesar'}`);
      }
    }

    // Save in batches of 200
    const batchSize = 200;
    for (let i = 0; i < productsToSave.length; i += batchSize) {
      const batch = productsToSave.slice(i, i + batchSize);
      await this.productRepo.saveMany(batch);
    }

    return { total: items.length, inserted, updated, errors };
  }
}

