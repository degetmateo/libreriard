import React, { useEffect, useState } from 'react';
import { BusinessStatisticsDto } from '@libreriard/shared';
import { OrderService } from '../services/order.service';
import {
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Users,
  Package,
  RefreshCw,
  CreditCard,
  CheckCircle,
  Clock,
  Truck,
  Building2,
  UserCheck
} from 'lucide-react';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendientes', color: 'bg-amber-500/10 text-amber-400 border-amber-500/30' },
  CONFIRMED: { label: 'Confirmadas', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' },
  PREPARING: { label: 'En Preparación', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30' },
  READY: { label: 'Listas para Retiro', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' },
  DELIVERED: { label: 'Entregadas', color: 'bg-teal-500/10 text-teal-400 border-teal-500/30' },
  CANCELLED: { label: 'Canceladas', color: 'bg-rose-500/10 text-rose-400 border-rose-500/30' }
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  TRANSFERENCIA: 'Transferencia Bancaria',
  EFECTIVO: 'Efectivo en Local',
  TARJETA_DEBITO: 'Tarjeta de Débito',
  TARJETA_CREDITO: 'Tarjeta de Crédito',
  CUENTA_CORRIENTE: 'Cuenta Corriente',
  OTRO: 'Otro Medio'
};

export const StatisticsPage: React.FC = () => {
  const [stats, setStats] = useState<BusinessStatisticsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const orderService = new OrderService();

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await orderService.getStatistics();
      if (res.success && res.data) {
        setStats(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-24 text-center space-y-3">
        <RefreshCw size={24} className="animate-spin text-cyan-400 mx-auto" />
        <p className="text-xs text-slate-400 font-medium">Calculando métricas del negocio...</p>
      </div>
    );
  }

  const { kpis, ordersByType, ordersByStatus, paymentMethods, topProducts, salesTrend } = stats;

  // Max daily amount for chart scaling
  const maxDayAmount = Math.max(...salesTrend.map((p) => p.totalAmount), 1);

  // Revenue ratio
  const totalCombined = (ordersByType.retailAmount || 0) + (ordersByType.wholesaleAmount || 0) || 1;
  const retailPct = Math.round((ordersByType.retailAmount / totalCombined) * 100);
  const wholesalePct = 100 - retailPct;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <span>Estadísticas y Métricas del Negocio</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Rendimiento de facturación, volumen de pedidos, distribución comercial y productos más vendidos.
          </p>
        </div>
        <button
          onClick={loadStats}
          className="px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-medium rounded-xl text-xs flex items-center gap-1.5 transition"
        >
          <RefreshCw size={13} />
          <span>Actualizar</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Facturación Total</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <DollarSign size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">
            ${kpis.totalRevenue.toLocaleString('es-AR')}
          </p>
          <p className="text-[10px] text-slate-500">Histórico de órdenes no canceladas</p>
        </div>

        {/* Current Month Revenue */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ventas de este Mes</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400 font-mono">
            ${kpis.monthRevenue.toLocaleString('es-AR')}
          </p>
          <p className="text-[10px] text-slate-500">Mes en curso</p>
        </div>

        {/* Orders & Ticket Promedio */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Ticket Promedio</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-indigo-300 font-mono">
            ${kpis.averageTicket.toLocaleString('es-AR')}
          </p>
          <p className="text-[10px] text-slate-500">Sobre un total de {kpis.totalOrders} pedidos</p>
        </div>

        {/* Customers count */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Clientes Registrados</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-300 font-mono">{kpis.totalCustomers}</p>
          <p className="text-[10px] text-slate-500">
            {kpis.retailCustomers} minoristas • {kpis.wholesaleCustomers} mayoristas
          </p>
        </div>
      </div>

      {/* Sales Trend Chart (Last 14 days) */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Evolución de Ventas Diarias</h2>
            <p className="text-[11px] text-slate-400">Facturación y cantidad de pedidos en los últimos 14 días</p>
          </div>
        </div>

        {/* Responsive CSS Bar Chart */}
        <div className="pt-6 pb-2 overflow-x-auto">
          <div className="min-w-[480px]">
            <div className="h-48 flex items-end gap-2 sm:gap-3 border-b border-slate-800 px-1">
              {salesTrend.map((point, idx) => {
                const heightPct = Math.max(6, Math.round((point.totalAmount / maxDayAmount) * 100));
                const hasSales = point.totalAmount > 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition pointer-events-none absolute bottom-full mb-2 bg-slate-950 border border-slate-700 px-2 py-1 rounded shadow-xl text-[10px] text-white whitespace-nowrap z-20">
                      <p className="font-bold text-cyan-400">${point.totalAmount.toLocaleString('es-AR')}</p>
                      <p className="text-slate-400">{point.ordersCount} pedidos ({point.date})</p>
                    </div>

                    {/* Value above bar */}
                    {hasSales && (
                      <span className="text-[8px] font-mono text-cyan-300 font-semibold hidden md:block">
                        ${Math.round(point.totalAmount / 1000)}k
                      </span>
                    )}

                    {/* Bar */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t transition-all ${
                        hasSales
                          ? 'bg-gradient-to-t from-cyan-600 to-cyan-400 group-hover:from-cyan-500 group-hover:to-cyan-300 shadow-sm shadow-cyan-500/20'
                          : 'bg-slate-800/40'
                      }`}
                    />
                  </div>
                );
              })}
            </div>

            {/* Labels underneath */}
            <div className="flex justify-between gap-2 sm:gap-3 px-1 pt-2">
              {salesTrend.map((point, idx) => (
                <span key={idx} className="flex-1 text-center text-[9px] font-mono text-slate-500">
                  {point.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Channel Distribution & Orders by status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Channel Breakdown: Minorista vs Mayorista */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 size={16} className="text-cyan-400" />
            <span>Distribución por Canal Comercial</span>
          </h2>

          <div className="space-y-3">
            {/* Visual ratio bar */}
            <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
              <div
                style={{ width: `${retailPct}%` }}
                className="bg-cyan-500 transition-all"
                title={`Minorista: ${retailPct}%`}
              />
              <div
                style={{ width: `${wholesalePct}%` }}
                className="bg-indigo-500 transition-all"
                title={`Mayorista: ${wholesalePct}%`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  <span>Minorista ({retailPct}%)</span>
                </div>
                <p className="text-lg font-black text-white font-mono">
                  ${ordersByType.retailAmount.toLocaleString('es-AR')}
                </p>
                <p className="text-[10px] text-slate-500">{ordersByType.retailCount} pedidos realizados</p>
              </div>

              <div className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold">
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-400" />
                  <span>Mayorista ({wholesalePct}%)</span>
                </div>
                <p className="text-lg font-black text-white font-mono">
                  ${ordersByType.wholesaleAmount.toLocaleString('es-AR')}
                </p>
                <p className="text-[10px] text-slate-500">{ordersByType.wholesaleCount} pedidos realizados</p>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Métodos de Pago Preferidos
            </span>
            <div className="flex flex-wrap gap-2">
              {Object.entries(paymentMethods).map(([pm, count]) => (
                <div
                  key={pm}
                  className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs flex items-center gap-2"
                >
                  <CreditCard size={13} className="text-slate-400" />
                  <span className="text-slate-300">{PAYMENT_METHOD_LABELS[pm] || pm}:</span>
                  <span className="font-bold text-white font-mono">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Orders by Status */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-400" />
            <span>Estado de los Pedidos</span>
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {Object.entries(STATUS_LABELS).map(([statusKey, cfg]) => {
              const count = ordersByStatus[statusKey] || 0;
              return (
                <div
                  key={statusKey}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${cfg.color}`}
                >
                  <span className="font-medium text-[11px] block">{cfg.label}</span>
                  <span className="text-xl font-black font-mono block text-white">{count}</span>
                </div>
              );
            })}
          </div>

          {/* Catalog health */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <Package size={14} className="text-cyan-400" />
              <span>Catálogo: {kpis.totalProducts} productos registrados</span>
            </span>
            <span className="text-emerald-400 font-semibold">
              {kpis.activeProducts} publicados y activos
            </span>
          </div>
        </div>
      </div>

      {/* Top Selling Products */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <ShoppingBag size={16} className="text-amber-400" />
          <span>Top 10 Productos Más Vendidos</span>
        </h2>

        {topProducts.length === 0 ? (
          <p className="text-xs text-slate-500 py-6 text-center">
            Aún no hay suficientes ventas registradas para generar el ranking de productos.
          </p>
        ) : (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-left uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3 w-12 text-center">#</th>
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3 text-center">Unidades Vendidas</th>
                    <th className="py-2.5 px-3 text-right">Facturación Generada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {topProducts.map((p, idx) => (
                    <tr key={p.productId || idx} className="hover:bg-slate-900/40 transition">
                      <td className="py-2.5 px-3 text-center font-bold font-mono text-cyan-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {p.productName}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-200">
                        {p.quantitySold} u.
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                        ${p.totalRevenue.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

