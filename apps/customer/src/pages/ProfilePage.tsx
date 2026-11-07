import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { OrderDto } from '@libreriard/shared';
import { OrderService } from '../services/order.service';
import { WholesaleRequestBox } from '../components/profile/WholesaleRequestBox';
import { User, ShoppingBag, Tag } from 'lucide-react';

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PREPARING: 'En Preparación',
  READY: 'Lista para Retiro',
  CONFIRMED: 'Confirmada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada'
};

export const ProfilePage: React.FC = () => {
  const { user, reloadUser } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    new OrderService().getMyOrders().then((res) => {
      if (res.success && res.data) setOrders(res.data);
    }).finally(() => setLoading(false));
  }, [user]);

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-sm">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xl">
            <User size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
            <p className="text-xs text-slate-500">CUIT: {user.cuitCuil} • {user.email}</p>
            {user.address && <p className="text-xs text-slate-400 mt-0.5">{user.address} (CP {user.postalCode || 'S/D'})</p>}
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${user.isWholesaleApproved ? 'bg-cyan-100 text-cyan-800' : 'bg-slate-100 text-slate-600'}`}>
          {user.isWholesaleApproved ? 'Cliente Mayorista' : 'Cliente Minorista'}
        </span>
      </div>

      <WholesaleRequestBox user={user} onRequested={reloadUser} />

      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center space-x-2 border-b border-slate-100 pb-3">
          <ShoppingBag size={20} className="text-cyan-600" />
          <h3 className="text-base font-bold text-slate-900">Historial de Mis Pedidos</h3>
        </div>

        {loading ? (
          <p className="text-xs text-slate-400 py-4 text-center">Cargando tus órdenes...</p>
        ) : orders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">Aún no has realizado ninguna compra en Librería Rubén Darío.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {orders.map((o) => {
              const hasDiscount = o.items.some((it) => it.discountApplied);
              return (
                <div key={o.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <span className="font-mono font-bold text-sm text-slate-900">{o.orderNumber}</span>
                    <span className="text-xs text-slate-400 block">
                      {new Date(o.createdAt).toLocaleDateString('es-AR')} • {o.items.length} artículos
                      {hasDiscount && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-bold ml-2">
                          <Tag size={10} /> Con descuento por cantidad
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-sm text-slate-900 block">${o.total.toLocaleString('es-AR')}</span>
                    <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[10px] font-bold mt-0.5">
                      {ORDER_STATUS_LABELS[o.status] || o.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
