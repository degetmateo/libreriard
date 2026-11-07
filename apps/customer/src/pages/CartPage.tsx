import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import { useNavigate, Link } from 'react-router-dom';
import { OrderService } from '../services/order.service';
import { TransferConfirmationModal } from '../components/cart/TransferConfirmationModal';
import { PaymentMethod, DeliveryMethod } from '@libreriard/shared';
import { SEOHead } from '../components/common/SEOHead';
import { Trash2, ArrowRight, Tag } from 'lucide-react';

export const CartPage: React.FC = () => {
  const { items, updateQuantity, removeItem, clearCart, getItemPricing, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.TRANSFERENCIA);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.RETIRO_LOCAL);
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [loading, setLoading] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const { alert } = useConfirm();
  const orderService = new OrderService();

  const executeOrder = async (receiptUrl?: string, receiptName?: string) => {
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }
    setLoading(true);
    const dto = {
      items: items.map((i) => ({ productId: i.product.id, subTypeId: i.variant?.id, quantity: i.quantity })),
      paymentMethod,
      deliveryMethod,
      deliveryAddress: deliveryMethod === DeliveryMethod.ENVIO_DOMICILIO ? deliveryAddress : undefined,
      transferReceiptUrl: receiptUrl,
      transferReceiptName: receiptName
    };
    const res = await orderService.createOrder(dto);
    setLoading(false);
    if (res.success && res.data) {
      clearCart();
      setTransferModalOpen(false);
      navigate('/order-success', { state: { order: res.data } });
    } else {
      await alert({
        title: 'Error al procesar el pedido',
        message: res.message || 'No se pudo completar la orden. Por favor verifique los datos ingresados.',
        variant: 'danger',
      });
    }
  };

  const handleCheckoutClick = () => {
    if (!user) {
      navigate('/login?redirect=/cart');
      return;
    }
    if (paymentMethod === PaymentMethod.TRANSFERENCIA) {
      setTransferModalOpen(true);
      return;
    }
    executeOrder();
  };

  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <SEOHead title="Mi Carrito" canonicalPath="/cart" noIndex={true} />
        <h2 className="text-2xl font-bold text-slate-800">Tu carrito está vacío</h2>
        <p className="text-sm text-slate-500">Explora nuestro catálogo para agregar productos escolares, comerciales y artísticos.</p>
        <Link to="/" className="inline-block px-6 py-2.5 bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm">Explorar Catálogo</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
      <SEOHead title="Mi Carrito" canonicalPath="/cart" noIndex={true} />
      <div className="md:col-span-2 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Carrito de Compras ({items.length})</h2>
          <button onClick={clearCart} className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 transition">
            <Trash2 size={14} /> <span>Vaciar Carrito</span>
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 p-4 shadow-sm">
          {items.map((item) => {
            const pricing = getItemPricing(item);
            return (
              <div key={`${item.product.id}-${item.variant?.id}`} className="py-3 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{item.product.name}</h4>
                  {item.variant && <p className="text-xs text-cyan-700">Variante: {item.variant.name}</p>}
                  <p className="text-xs text-slate-500">
                    ${pricing.unitPrice.toLocaleString('es-AR')} c/u
                    {pricing.discountApplied && (
                      <span className="line-through text-slate-400 ml-1.5">${pricing.originalUnitPrice.toLocaleString('es-AR')}</span>
                    )}
                  </p>
                  {pricing.discountApplied && (
                    <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded border border-emerald-200 font-bold mt-1">
                      <Tag size={10} /> ¡Descuento por cantidad aplicado!
                    </span>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center border border-slate-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)} className="px-2 py-1 text-slate-600 font-bold">-</button>
                    <span className="px-3 text-xs font-bold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)} className="px-2 py-1 text-slate-600 font-bold">+</button>
                  </div>
                  <span className="text-sm font-bold text-slate-900 w-24 text-right">${pricing.subtotal.toLocaleString('es-AR')}</span>
                  <button onClick={() => removeItem(item.product.id, item.variant?.id)} className="text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 shadow-sm">
          <h3 className="font-bold text-base text-slate-900">Resumen y Opciones</h3>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Método de Entrega</label>
            <select value={deliveryMethod} onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800">
              <option value={DeliveryMethod.RETIRO_LOCAL}>Retiro en el local (Gratis)</option>
              <option value={DeliveryMethod.ENVIO_DOMICILIO}>Envío a Domicilio</option>
            </select>
            {deliveryMethod === DeliveryMethod.ENVIO_DOMICILIO && (
              <input type="text" placeholder="Dirección de entrega" value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} className="w-full mt-2 bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs" />
            )}
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Método de Pago</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800">
              <option value={PaymentMethod.TRANSFERENCIA}>Transferencia Bancaria</option>
              <option value={PaymentMethod.EFECTIVO}>Efectivo en el local</option>
              <option value={PaymentMethod.TARJETA_DEBITO}>Tarjeta de Débito</option>
              <option value={PaymentMethod.TARJETA_CREDITO}>Tarjeta de Crédito</option>
              <option value={PaymentMethod.CUENTA_CORRIENTE}>Cuenta Corriente</option>
              <option value={PaymentMethod.OTRO}>Otro medio acordado</option>
            </select>
          </div>
          <div className="pt-3 border-t border-slate-100 flex justify-between items-baseline">
            <span className="text-sm font-bold text-slate-600">Total:</span>
            <span className="text-2xl font-black text-slate-950">${subtotal.toLocaleString('es-AR')}</span>
          </div>
          <button onClick={handleCheckoutClick} disabled={loading} className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition">
            <span>{loading ? 'Confirmando orden...' : user ? 'Confirmar Pedido' : 'Iniciar Sesión para Confirmar'}</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <TransferConfirmationModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onConfirmed={(url, name) => executeOrder(url, name)}
      />
    </div>
  );
};
