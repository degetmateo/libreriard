import { CreateProductDto } from '@libreriard/shared';

export const SEED_PRODUCTS: CreateProductDto[] = [
  {
    name: 'Cuaderno Rivadavia Tapa Dura 100 Hojas',
    description: 'Cuaderno escolar clásico tapa dura forrado araña, cosido y con papel de 88g.',
    barcode: '7791234500011',
    retailPrice: 6500,
    wholesalePrice: 4800,
    supplier: 'Rivadavia',
    categories: ['Escolar', 'Cuadernos'],
    tags: ['cuaderno', 'tapa dura', 'escolar', '100 hojas'],
    images: [{ url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    subTypes: [
      { id: 'v1', name: 'Rayado', priceModifier: 0, barcode: '7791234500012' },
      { id: 'v2', name: 'Cuadriculado', priceModifier: 0, barcode: '7791234500013' }
    ]
  },
  {
    name: 'Resma Autor A4 75g 500 Hojas',
    description: 'Papel obra multifunción extra blanco para fotocopiadoras e impresoras láser/inkjet.',
    barcode: '7791234500028',
    retailPrice: 7200,
    wholesalePrice: 5400,
    supplier: 'Ledesma',
    categories: ['Comercial', 'Papelería'],
    tags: ['resma', 'papel', 'a4', 'impresion', 'oficina'],
    images: [{ url: 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    subTypes: []
  },
  {
    name: 'Bolígrafo BIC Cristal Azul Caja x 50 unidades',
    description: 'El clásico bolígrafo de trazo medio 1.0mm con punta de carburo de tungsteno.',
    barcode: '7791234500035',
    retailPrice: 14500,
    wholesalePrice: 10800,
    supplier: 'BIC Argentina',
    categories: ['Escritura', 'Comercial'],
    tags: ['birome', 'bic', 'azul', 'caja', 'escritura'],
    images: [{ url: 'https://images.unsplash.com/photo-1585336261026-7f4150567df4?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    subTypes: []
  },
  {
    name: 'Repuesto Éxito 480 Hojas N° 3',
    description: 'Repuesto reforzado para carpeta escolar de 3 perforaciones, papel blanco de 100g.',
    barcode: '7791234500042',
    retailPrice: 16900,
    wholesalePrice: 12500,
    supplier: 'Ledesma',
    categories: ['Escolar', 'Papelería'],
    tags: ['repuesto', 'exito', '480 hojas', 'escolar'],
    images: [{ url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    subTypes: [
      { id: 'v1', name: 'Rayado', priceModifier: 0 },
      { id: 'v2', name: 'Cuadriculado', priceModifier: 0 }
    ]
  },
  {
    name: 'Lápices de Colores Faber-Castell Ecolápiz x 24',
    description: 'Lápices de colores permanentes con mina súper resistente y tecnología SV.',
    barcode: '7791234500059',
    retailPrice: 8900,
    wholesalePrice: 6600,
    supplier: 'Faber-Castell',
    categories: ['Artística', 'Escolar'],
    tags: ['lapices', 'colores', 'faber castell', 'dibujo'],
    images: [{ url: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=60', isPrimary: true }],
    subTypes: []
  }
];
