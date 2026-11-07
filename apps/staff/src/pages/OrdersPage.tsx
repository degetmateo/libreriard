import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderDto, OrderStatus } from '@libreriard/shared';
import { OrderService } from '../services/order.service';
import { OrderDetailModal } from '../components/orders/OrderDetailModal';
import { OrderReceiptModal } from '../components/orders/OrderReceiptModal';
import { Badge } from '../components/common/Badge';
import { Pagination } from '../components/common/Pagination';
import { Eye, Search, Plus, RotateCcw, Printer, ArrowUpDown } from 'lucide-react';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]: 'Pendiente',
  [OrderStatus.PREPARING]: 'En Preparación',
  [OrderStatus.READY]: 'Lista',
  [OrderStatus.CONFIRMED]: 'Confirmada',
  [OrderStatus.DELIVERED]: 'Entregada',
  [OrderStatus.CANCELLED]: 'Cancelada'
};

export const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedOrder, setSelectedOrder] = useState<OrderDto | null>(null);
  const [receiptOrder, setReceiptOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(true);
  const orderService = new OrderService();

  const loadOrders = async () => {
    setLoading(true);
    const params: Record<string, string | number> = {
      page,
      limit: 15,
      sortBy,
      sortOrder
    };
    if (filterStatus) params.status = filterStatus;
    if (search.trim()) params.search = search.trim();

    const res = await orderService.getOrders(params);
    if (res.success && res.data) {
      setOrders(res.data);
      setTotalItems(res.total || res.data.length);
      setTotalPages(res.totalPages || Math.ceil((res.total || res.data.length) / 15) || 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, [filterStatus, search, page, sortBy, sortOrder]);

  const handleCloneOrder = (order: OrderDto) => {
    navigate('/orders/create', { state: { cloneOrder: order } });
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  const getStatusVariant = (s: OrderStatus) => {
    if (s === OrderStatus.CONFIRMED || s === OrderStatus.DELIVERED) return 'green';
    if (s === OrderStatus.PENDING || s === OrderStatus.PREPARING) return 'amber';
    if (s === OrderStatus.CANCELLED) return 'red';
    return 'cyan';
  };

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por número o cliente..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/orders/create')}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus size={15} />
            <span>Crear Orden Manual</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => { setFilterStatus(''); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
            !filterStatus ? 'bg-cyan-400 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
          }`}
        >
          Todas
        </button>
        {Object.values(OrderStatus).map((st) => (
          <button
            key={st}
            onClick={() => { setFilterStatus(st); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
              filterStatus === st ? 'bg-cyan-400 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            {ORDER_STATUS_LABELS[st]}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 text-[10px] uppercase border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort('orderNumber')}>
                  <div className="flex items-center gap-1">
                    <span>Nº Orden</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-3">Cliente</th>
                <th className="p-3">Tipo</th>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort('total')}>
                  <div className="flex items-center gap-1">
                    <span>Total</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-3">Saldo Pend.</th>
                <th className="p-3">Estado</th>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    <span>Fecha</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    Cargando órdenes...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-500">
                    No se encontraron órdenes registradas.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const advance = o.advancePayment || 0;
                  const balance = o.remainingBalance !== undefined ? o.remainingBalance : Math.max(0, o.total - advance);

                  return (
                    <tr key={o.id} className="hover:bg-slate-900/40 transition">
                      <td className="p-3 font-mono font-bold text-white">
                        #{o.orderNumber}
                      </td>
                      <td className="p-3">
                        <p className="font-semibold text-slate-200">{o.customer.name}</p>
                        <p className="text-[11px] text-slate-500">{o.customer.cuitCuil || o.customer.email}</p>
                      </td>
                      <td className="p-3">
                        <Badge
                          label={o.orderType === 'WHOLESALE' ? 'MAYORISTA' : 'MINORISTA'}
                          variant={o.orderType === 'WHOLESALE' ? 'cyan' : 'slate'}
                        />
                      </td>
                      <td className="p-3 font-mono font-bold text-white">
                        ${o.total.toLocaleString('es-AR')}
                      </td>
                      <td className="p-3 font-mono text-[11px]">
                        {advance > 0 ? (
                          <span className="text-amber-400 font-semibold">${balance.toLocaleString('es-AR')}</span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          label={ORDER_STATUS_LABELS[o.status] || o.status}
                          variant={getStatusVariant(o.status)}
                        />
                      </td>
                      <td className="p-3 text-slate-400 text-[11px]">
                        {new Date(o.createdAt).toLocaleDateString('es-AR')}
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedOrder(o)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                            title="Ver detalles"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => setReceiptOrder(o)}
                            className="p-1.5 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 rounded-lg transition"
                            title="Comprobante / PDF / Imprimir"
                          >
                            <Printer size={15} />
                          </button>
                          <button
                            onClick={() => handleCloneOrder(o)}
                            className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition"
                            title="Rehacer / Clonar orden"
                          >
                            <RotateCcw size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 pb-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={15}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={Boolean(selectedOrder)}
        onClose={() => setSelectedOrder(null)}
        onUpdated={loadOrders}
      />

      {/* Order Receipt / Printable / Export Modal */}
      <OrderReceiptModal
        order={receiptOrder}
        isOpen={Boolean(receiptOrder)}
        onClose={() => setReceiptOrder(null)}
      />
    </div>
  );
};
