import React, { useEffect, useState } from 'react';
import { OrderDto, OrderStatus } from '@libreriard/shared';
import { OrderService } from '../services/order.service';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';
import { Badge } from '../components/common/Badge';
import { Eye, Search } from 'lucide-react';

export const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const orderService = new OrderService();

  const loadOrders = async () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (filterStatus) params.status = filterStatus;
    if (search) params.search = search;
    const res = await orderService.getOrders(params);
    if (res.success && res.data) setOrders(res.data);
    setLoading(false);
  };

  useEffect(() => { loadOrders(); }, [filterStatus, search]);

  const getStatusVariant = (s: OrderStatus) => {
    if (s === OrderStatus.CONFIRMED || s === OrderStatus.DELIVERED) return 'green';
    if (s === OrderStatus.PENDING || s === OrderStatus.PREPARING) return 'amber';
    if (s === OrderStatus.CANCELLED) return 'red';
    return 'cyan';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 sm:pb-0">
          <button onClick={() => setFilterStatus('')} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${!filterStatus ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>Todas</button>
          {Object.values(OrderStatus).map(st => (
            <button key={st} onClick={() => setFilterStatus(st)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap ${filterStatus === st ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>{st}</button>
          ))}
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">Nº Orden</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Tipo</th>
              <th className="p-3">Total</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Ver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Cargando órdenes...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">No hay órdenes para mostrar.</td></tr>
            ) : orders.map(o => (
              <tr key={o.id} className="hover:bg-slate-900/40">
                <td className="p-3 font-mono font-bold text-white">{o.orderNumber}</td>
                <td className="p-3">
                  <p className="font-semibold text-slate-200">{o.customer.name}</p>
                  <p className="text-xs text-slate-500">{o.customer.email}</p>
                </td>
                <td className="p-3"><Badge label={o.orderType} variant={o.orderType === 'WHOLESALE' ? 'cyan' : 'slate'} /></td>
                <td className="p-3 font-bold text-white">${o.total.toLocaleString('es-AR')}</td>
                <td className="p-3"><Badge label={o.status} variant={getStatusVariant(o.status)} /></td>
                <td className="p-3 text-right">
                  <button onClick={() => setSelectedOrder(o)} className="text-slate-400 hover:text-cyan-400 p-1"><Eye size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <OrderDetailModal order={selectedOrder} isOpen={Boolean(selectedOrder)} onClose={() => setSelectedOrder(null)} onUpdated={loadOrders} />
    </div>
  );
};
