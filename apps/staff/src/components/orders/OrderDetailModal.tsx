import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../common/Modal';
import { OrderDto, OrderStatus } from '@libreriard/shared';
import { OrderService } from '../../services/order.service';
import { Badge } from '../common/Badge';
import { Download, FileCheck, AlertTriangle, Percent, Printer, RotateCcw } from 'lucide-react';
import { ORDER_STATUS_LABELS } from '../../pages/OrdersPage';
import { OrderReceiptModal } from './OrderReceiptModal';

interface OrderDetailModalProps {
  order: OrderDto | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

const PAYMENT_LABELS: Record<string, string> = {
  TRANSFERENCIA: 'Transferencia Bancaria',
  EFECTIVO: 'Efectivo en el local',
  TARJETA_DEBITO: 'Tarjeta de Débito',
  TARJETA_CREDITO: 'Tarjeta de Crédito',
  CUENTA_CORRIENTE: 'Cuenta Corriente',
  OTRO: 'Otro medio'
};

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose, onUpdated }) => {
  if (!order) return null;
  const navigate = useNavigate();
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes || '');
  const [loading, setLoading] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const orderService = new OrderService();

  const handleCloneOrder = () => {
    onClose();
    navigate('/orders/create', { state: { cloneOrder: order } });
  };

  const handleUpdateStatus = async () => {
    setLoading(true);
    await orderService.updateOrderStatus(order.id, newStatus, notes);
    setLoading(false);
    onUpdated();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Detalles de Orden #${order.orderNumber}`} maxWidth="max-w-2xl">
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        <div className="bg-slate-800/60 p-4 rounded-lg flex justify-between items-center text-sm">
          <div>
            <p className="font-bold text-white">{order.customer.name}</p>
            <p className="text-xs text-slate-400">CUIT: {order.customer.cuitCuil} | {order.customer.email}</p>
            {order.customer.phone && <p className="text-xs text-slate-400">Tel: {order.customer.phone}</p>}
          </div>
          <div className="text-right">
            <Badge label={order.orderType === 'WHOLESALE' ? 'MAYORISTA' : 'MINORISTA'} variant={order.orderType === 'WHOLESALE' ? 'cyan' : 'slate'} />
            <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Artículos</h4>
          <div className="bg-slate-950 border border-slate-800 rounded-lg divide-y divide-slate-800">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex justify-between items-center text-sm">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">{item.productName}</p>
                    {item.discountApplied && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/30 font-semibold">
                        <Percent size={10} /> Escala aplicada
                      </span>
                    )}
                  </div>
                  {item.subTypeName && <p className="text-xs text-cyan-400">Variante: {item.subTypeName}</p>}
                  <p className="text-xs text-slate-400">
                    {item.quantity} x ${item.unitPrice.toLocaleString('es-AR')}
                    {item.originalUnitPrice && (
                      <span className="line-through text-slate-500 ml-1.5">(${item.originalUnitPrice.toLocaleString('es-AR')})</span>
                    )}
                  </p>
                </div>
                <span className="font-bold text-white">${item.subtotal.toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>Subtotal Items</span>
            <span className="font-semibold">${order.subtotal.toLocaleString('es-AR')}</span>
          </div>
          <div className="flex justify-between items-center text-slate-200">
            <span className="font-bold">Total Orden</span>
            <span className="text-base font-extrabold text-white">${order.total.toLocaleString('es-AR')}</span>
          </div>
          {(order.advancePayment !== undefined && order.advancePayment > 0) && (
            <>
              <div className="flex justify-between items-center text-emerald-400">
                <span>Adelanto Pagado</span>
                <span className="font-semibold">-${order.advancePayment.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between items-center pt-1 border-t border-slate-800 text-cyan-400 font-bold">
                <span>Saldo Restante a Cobrar</span>
                <span className="text-base font-black">${(order.remainingBalance ?? (order.total - order.advancePayment)).toLocaleString('es-AR')}</span>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowReceipt(true)}
            className="flex-1 min-w-[140px] px-3 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <Printer size={14} />
            <span>Ver Comprobante / Exportar</span>
          </button>
          <button
            type="button"
            onClick={handleCloneOrder}
            className="flex-1 min-w-[140px] px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition"
          >
            <RotateCcw size={14} />
            <span>Rehacer / Clonar Orden</span>
          </button>
        </div>

        <div className="bg-slate-800/40 p-3 rounded-lg space-y-2 text-xs text-slate-300">
          <p><strong>Método de Pago:</strong> {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>
          <p><strong>Método de Entrega:</strong> {order.deliveryMethod === 'RETIRO_LOCAL' ? 'Retiro en el local' : `Envío a domicilio (${order.deliveryAddress || 'Sin dirección'})`}</p>
        </div>

        {order.paymentMethod === 'TRANSFERENCIA' && (
          <div className="p-3 bg-cyan-950/40 border border-cyan-800/50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              {order.transferReceiptUrl ? <FileCheck size={18} className="text-emerald-400" /> : <AlertTriangle size={18} className="text-amber-400" />}
              <span className="text-xs text-slate-200 font-medium">
                {order.transferReceiptUrl ? 'Comprobante de transferencia adjunto' : 'Sin comprobante'}
              </span>
            </div>
            {order.transferReceiptUrl && (
              <a href={order.transferReceiptUrl} target="_blank" rel="noreferrer" download className="px-3 py-1 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1 transition">
                <Download size={13} /> <span>Descargar</span>
              </a>
            )}
          </div>
        )}

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 font-medium">Estado:</label>
            <select value={newStatus} onChange={e => setNewStatus(e.target.value as OrderStatus)} className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2">
              {Object.values(OrderStatus).map(st => (
                <option key={st} value={st}>{ORDER_STATUS_LABELS[st] || st}</option>
              ))}
            </select>
          </div>
          <button onClick={handleUpdateStatus} disabled={loading} className="px-4 py-2 bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs">
            {loading ? 'Guardando...' : 'Actualizar Estado'}
          </button>
        </div>
      </div>

      <OrderReceiptModal
        order={order}
        isOpen={showReceipt}
        onClose={() => setShowReceipt(false)}
      />
    </Modal>
  );
};
