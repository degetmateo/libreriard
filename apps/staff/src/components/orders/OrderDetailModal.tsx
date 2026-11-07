import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { OrderDto, OrderStatus } from '@libreriard/shared';
import { OrderService } from '../../services/order.service';
import { Badge } from '../common/Badge';

interface OrderDetailModalProps {
  order: OrderDto | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: () => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose, onUpdated }) => {
  if (!order) return null;
  const [newStatus, setNewStatus] = useState<OrderStatus>(order.status);
  const [notes, setNotes] = useState(order.notes || '');
  const [loading, setLoading] = useState(false);
  const orderService = new OrderService();

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
            <Badge label={order.orderType} variant={order.orderType === 'WHOLESALE' ? 'cyan' : 'slate'} />
            <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString('es-AR')}</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Artículos</h4>
          <div className="bg-slate-950 border border-slate-800 rounded-lg divide-y divide-slate-800">
            {order.items.map((item, idx) => (
              <div key={idx} className="p-3 flex justify-between items-center text-sm">
                <div>
                  <p className="font-medium text-white">{item.productName}</p>
                  {item.subTypeName && <p className="text-xs text-cyan-400">Variante: {item.subTypeName}</p>}
                  <p className="text-xs text-slate-400">{item.quantity} x ${item.unitPrice.toLocaleString('es-AR')}</p>
                </div>
                <span className="font-bold text-white">${item.subtotal.toLocaleString('es-AR')}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center p-3 bg-slate-950 border border-slate-800 rounded-lg text-sm">
          <span className="font-semibold text-slate-300">Total a Pagar</span>
          <span className="text-lg font-extrabold text-cyan-400">${order.total.toLocaleString('es-AR')}</span>
        </div>

        <div className="bg-slate-800/40 p-3 rounded-lg space-y-2 text-xs text-slate-300">
          <p><strong>Método de Pago:</strong> {order.paymentMethod}</p>
          <p><strong>Método de Entrega:</strong> {order.deliveryMethod === 'RETIRO_LOCAL' ? 'Retiro en el local' : `Envío a domicilio (${order.deliveryAddress || 'Sin dirección'})`}</p>
        </div>

        <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <label className="text-xs text-slate-400 font-medium">Estado:</label>
            <select
              value={newStatus}
              onChange={e => setNewStatus(e.target.value as OrderStatus)}
              className="bg-slate-800 border border-slate-700 text-white text-xs rounded-lg p-2"
            >
              {Object.values(OrderStatus).map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          <button
            onClick={handleUpdateStatus}
            disabled={loading}
            className="px-4 py-2 bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs"
          >
            {loading ? 'Guardando...' : 'Actualizar Estado'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
