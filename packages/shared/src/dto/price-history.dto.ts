export interface PriceHistoryDto {
  id: string;
  productId: string;
  productName: string;
  priceType: 'RETAIL' | 'WHOLESALE';
  oldPrice: number | null;
  newPrice: number | null;
  diffAmount: number;
  diffPercentage: number;
  changedBy?: {
    id: string;
    name: string;
    email: string;
  };
  source: string;
  createdAt: string;
}

