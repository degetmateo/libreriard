import React, { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users, AlertCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductService } from '../services/product.service';
import { OrderService } from '../services/order.service';
import { CustomerService } from '../services/customer.service';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({ products: 0, pendingOrders: 0, customers: 0, wholesalePending: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      new ProductService().getProducts({ limit: 1 }),
      new OrderService().getOrders({ status: 'PENDING', limit: 1 }),
      new CustomerService().getCustomers({ limit: 1 }),
      new CustomerService().getCustomers({ wholesalePendingOnly: true, limit: 1 })
    ]).then(([prodRes, ordRes, custRes, whRes]) => {
      setStats({
        products: (prodRes as any).total || 0,
        pendingOrders: (ordRes as any).total || 0,
        customers: (custRes as any).total || 0,
        wholesalePending: (whRes as any).total || 0
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { title: 'Productos en Catálogo', value: stats.products, icon: Package, to: '/products', color: 'text-cyan-400' },
    { title: 'Órdenes Pendientes', value: stats.pendingOrders, icon: ShoppingCart, to: '/orders', color: 'text-amber-400' },
    { title: 'Clientes Registrados', value: stats.customers, icon: Users, to: '/customers', color: 'text-emerald-400' },
    { title: 'Solicitudes Mayoristas', value: stats.wholesalePending, icon: AlertCircle, to: '/customers?filter=wholesale', color: 'text-rose-400' }
  ];

  if (loading) {
    return <div className="p-8 text-center text-slate-400">Cargando métricas del sistema...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <Icon size={20} className={card.color} />
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-3xl font-extrabold text-white">{card.value}</span>
                <Link to={card.to} className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center space-x-1">
                  <span>Ver</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-6">
        <h3 className="text-base font-bold text-white mb-2">Bienvenido al Centro de Control de Librería Rubén Darío</h3>
        <p className="text-sm text-slate-400">
          Desde este panel puedes administrar el catálogo de artículos escolares, comerciales y artísticos, controlar las órdenes en tiempo real, habilitar a clientes mayoristas con precios preferenciales y consultar las auditorías del sistema.
        </p>
      </div>
    </div>
  );
};
