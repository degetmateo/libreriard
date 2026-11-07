export interface SalesTrendPoint {
  date: string;
  label: string;
  totalAmount: number;
  ordersCount: number;
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  totalRevenue: number;
}

export interface BusinessStatisticsDto {
  kpis: {
    totalRevenue: number;
    monthRevenue: number;
    totalOrders: number;
    averageTicket: number;
    totalCustomers: number;
    wholesaleCustomers: number;
    retailCustomers: number;
    totalProducts: number;
    activeProducts: number;
  };
  ordersByStatus: Record<string, number>;
  ordersByType: {
    retailCount: number;
    retailAmount: number;
    wholesaleCount: number;
    wholesaleAmount: number;
  };
  paymentMethods: Record<string, number>;
  topProducts: TopSellingProduct[];
  salesTrend: SalesTrendPoint[];
}

