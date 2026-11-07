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

export const retailPriceTierSchema = z.object({
  minQuantity: z.number().int().min(2, 'La cantidad mínima debe ser al menos 2.'),
  unitPrice: z.number().positive('El precio unitario debe ser mayor a 0.')
});

export const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre del producto es obligatorio.'),
  description: z.string().optional(),
  barcode: z.string().optional(),
  retailPrice: z.number().nullable().optional(),
  wholesalePrice: z.number().nullable().optional(),
  retailPriceTiers: z.array(retailPriceTierSchema).optional(),
  images: z.array(productImageSchema).optional(),
  subTypes: z.array(productVariantSchema).optional(),
  supplier: z.string().optional(),
  categories: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional()
});

export const updateProductSchema = createProductSchema.partial();
