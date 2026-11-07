import { z } from 'zod';

export const productVariantSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'El nombre de la variante es obligatorio.'),
  sku: z.string().optional(),
  priceModifier: z.number().default(0),
  barcode: z.string().optional()
});

export const productImageSchema = z.object({
  url: z.string().url('URL de imagen inválida.'),
  publicId: z.string().optional(),
  isPrimary: z.boolean().default(false)
});

export const createProductSchema = z.object({
  name: z.string().min(2, 'El nombre del producto es obligatorio.'),
  description: z.string().default(''),
  barcode: z.string().min(1, 'El código de barras es obligatorio.'),
  retailPrice: z.number().min(0, 'El precio minorista debe ser mayor o igual a 0.'),
  wholesalePrice: z.number().min(0, 'El precio mayorista debe ser mayor o igual a 0.'),
  images: z.array(productImageSchema).optional(),
  subTypes: z.array(productVariantSchema).optional(),
  supplier: z.string().default(''),
  categories: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  isActive: z.boolean().default(true)
});

export const updateProductSchema = createProductSchema.partial();
