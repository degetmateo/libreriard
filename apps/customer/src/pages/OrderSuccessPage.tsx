import React from 'react';
import { useLocation, Link, Navigate } from 'react-router-dom';
import { OrderDto, PaymentMethod } from '@libreriard/shared';
import { BankTransferBox } from '../components/cart/BankTransferBox';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const location = useLocation();
  const order = location.state?.order as OrderDto | undefined;

  if (!order) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-xl mx-auto py-10 px-4 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-lg space-y-4">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">¡Muchas gracias por tu compra!</h2>
        <p className="text-sm text-slate-500">
          Tu pedido ha sido registrado con éxito. Hemos enviado un correo electrónico a <strong>{order.customer.email}</strong> con los detalles y el comprobante de tu orden.
        </p>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-center">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Número de Orden</span>
          <span className="text-2xl font-mono font-black text-cyan-600">{order.orderNumber}</span>
          <span className="block text-xs font-semibold text-slate-700 mt-2">Total: ${order.total.toLocaleString('es-AR')}</span>
        </div>

        {order.paymentMethod === PaymentMethod.TRANSFERENCIA && (
          <div className="text-left mt-4">
            <BankTransferBox />
          </div>
        )}

        <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/profile"
            className="px-6 py-2.5 bg-slate-900 text-cyan-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition"
          >
            Ver mis Pedidos
          </Link>
          <Link
            to="/"
            className="px-6 py-2.5 bg-cyan-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-cyan-300 transition flex items-center justify-center space-x-1"
          >
            <span>Seguir Comprando</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

