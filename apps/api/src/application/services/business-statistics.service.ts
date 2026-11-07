import { IOrderRepository } from '../../domain/repositories/order.repository.interface';
import { IProductRepository } from '../../domain/repositories/product.repository.interface';
import { ICustomerUserRepository } from '../../domain/repositories/customer-user.repository.interface';
import { BusinessStatisticsDto, OrderStatus, OrderType, SalesTrendPoint, TopSellingProduct } from '@libreriard/shared';
import { MongoClient } from '../../infrastructure/database/mongo-client';

export class BusinessStatisticsService {
  constructor(
    private readonly orderRepo: IOrderRepository,
    private readonly productRepo: IProductRepository,
    private readonly customerRepo: ICustomerUserRepository
  ) {}

  public async getStatistics(): Promise<BusinessStatisticsDto> {
    const db = MongoClient.getInstance().getDb();
    const ordersCol = db.collection('orders');
    const productsCol = db.collection('products');
    const customersCol = db.collection('customer_users');

    // 1. Fetch all orders (non-cancelled for revenue calculation)
    const orders = await ordersCol.find({}).toArray();
    const totalProducts = await productsCol.countDocuments({});
    const activeProducts = await productsCol.countDocuments({ isActive: true });
    const totalCustomers = await customersCol.countDocuments({});
    const wholesaleCustomers = await customersCol.countDocuments({ isWholesaleApproved: true });
    const retailCustomers = Math.max(0, totalCustomers - wholesaleCustomers);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let totalRevenue = 0;
    let monthRevenue = 0;
    const ordersByStatus: Record<string, number> = {};
    const paymentMethods: Record<string, number> = {};
    let retailCount = 0;
    let retailAmount = 0;
    let wholesaleCount = 0;
    let wholesaleAmount = 0;

    const productSalesMap = new Map<string, { name: string; qty: number; revenue: number }>();

    orders.forEach((o) => {
      const status = String(o.status || OrderStatus.PENDING);
      ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;

      const pMethod = String(o.paymentMethod || 'OTRO');
      paymentMethods[pMethod] = (paymentMethods[pMethod] || 0) + 1;

      const oTotal = Number(o.total) || 0;
      const isCancelled = status === OrderStatus.CANCELLED;

      if (!isCancelled) {
        totalRevenue += oTotal;
        const oDate = new Date(o.createdAt);
        if (oDate >= startOfMonth) {
          monthRevenue += oTotal;
        }

        if (o.orderType === OrderType.WHOLESALE) {
          wholesaleCount++;
          wholesaleAmount += oTotal;
        } else {
          retailCount++;
          retailAmount += oTotal;
        }

        if (Array.isArray(o.items)) {
          o.items.forEach((it: any) => {
            const pId = String(it.productId || it.productName);
            const pName = String(it.productName || 'Producto');
            const qty = Number(it.quantity) || 0;
            const sub = Number(it.subtotal) || 0;
            const existing = productSalesMap.get(pId) || { name: pName, qty: 0, revenue: 0 };
            existing.qty += qty;
            existing.revenue += sub;
            productSalesMap.set(pId, existing);
          });
        }
      }
    });

    const totalOrders = orders.length;
    const averageTicket = totalOrders > 0 ? Math.round(totalRevenue / (orders.filter(o => o.status !== OrderStatus.CANCELLED).length || 1)) : 0;

    // 2. Top Selling Products
    const topProducts: TopSellingProduct[] = Array.from(productSalesMap.entries())
      .map(([productId, val]) => ({
        productId,
        productName: val.name,
        quantitySold: val.qty,
        totalRevenue: Math.round(val.revenue * 100) / 100
      }))
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, 10);

    // 3. Sales trend for last 14 days
    const salesTrend: SalesTrendPoint[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const label = `${dd}/${mm}`;

      let dayTotal = 0;
      let dayCount = 0;

      orders.forEach((o) => {
        if (o.status !== OrderStatus.CANCELLED) {
          const oDate = new Date(o.createdAt);
          const oYear = oDate.getFullYear();
          const oMonth = String(oDate.getMonth() + 1).padStart(2, '0');
          const oDay = String(oDate.getDate()).padStart(2, '0');
          if (`${oYear}-${oMonth}-${oDay}` === dateStr) {
            dayTotal += Number(o.total) || 0;
            dayCount++;
          }
        }
      });

      salesTrend.push({
        date: dateStr,
        label,
        totalAmount: Math.round(dayTotal * 100) / 100,
        ordersCount: dayCount
      });
    }

    return {
      kpis: {
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        monthRevenue: Math.round(monthRevenue * 100) / 100,
        totalOrders,
        averageTicket,
        totalCustomers,
        wholesaleCustomers,
        retailCustomers,
        totalProducts,
        activeProducts
      },
      ordersByStatus,
      ordersByType: {
        retailCount,
        retailAmount: Math.round(retailAmount * 100) / 100,
        wholesaleCount,
        wholesaleAmount: Math.round(wholesaleAmount * 100) / 100
      },
      paymentMethods,
      topProducts,
      salesTrend
    };
  }
}

