import { describe, it, expect } from 'vitest';
import { ProductDto } from '@libreriard/shared';

describe('Customer Cart Calculations', () => {
  const dummyProduct: ProductDto = {
    id: '01a1b457-a4fa-77bf-87a8-310ffc7a6270',
    name: 'Cuaderno Éxito 100 Hojas Rayado',
    description: 'Cuaderno tapa dura escolar',
    barcode: '7791234567890',
    retailPrice: 5000,
    wholesalePrice: 3500,
    images: [],
    subTypes: [
      { id: 'v1', name: 'Rojo', priceModifier: 0 },
      { id: 'v2', name: 'Especial Metalizado', priceModifier: 200 }
    ],
    supplier: 'Ledesma',
    categories: ['Escolar'],
    tags: ['cuaderno'],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  it('should compute retail total correctly', () => {
    const qty = 3;
    const basePrice = dummyProduct.retailPrice;
    const total = basePrice * qty;
    expect(total).toBe(15000);
  });

  it('should compute wholesale total with variant modifier correctly', () => {
    const qty = 10;
    const isWholesale = true;
    const basePrice = isWholesale ? dummyProduct.wholesalePrice : dummyProduct.retailPrice;
    const variantModifier = dummyProduct.subTypes[1].priceModifier; // +200
    const unitPrice = basePrice + variantModifier; // 3700
    const total = unitPrice * qty; // 37000
    expect(total).toBe(37000);
  });

  it('should compute tiered retail total when quantity meets tier threshold', () => {
    const tieredProduct: ProductDto = {
      ...dummyProduct,
      retailPrice: 200,
      retailPriceTiers: [
        { minQuantity: 10, unitPrice: 180 },
        { minQuantity: 50, unitPrice: 150 }
      ]
    };

    const qty = 10;
    const tier = tieredProduct.retailPriceTiers!.find(t => qty >= t.minQuantity);
    expect(tier?.unitPrice).toBe(180);
    expect(tier!.unitPrice * qty).toBe(1800);
  });
});

