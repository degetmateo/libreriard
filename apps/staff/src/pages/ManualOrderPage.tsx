import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OrderType, PaymentMethod, DeliveryMethod, OrderDto } from '@libreriard/shared';
import { ManualOrderTable, ManualItemRow } from '../components/orders/ManualOrderTable';
import { OrderReceiptModal } from '../components/orders/OrderReceiptModal';
import { OrderService } from '../services/order.service';
import { ShoppingCart, User, CreditCard, Truck, DollarSign, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

export const ManualOrderPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const orderService = new OrderService();

  const [orderType, setOrderType] = useState<OrderType>(OrderType.RETAIL);
  const [rows, setRows] = useState<ManualItemRow[]>([
    {
      id: `row-${Date.now()}`,
      productName: '',
      quantity: 1,
      unitPrice: 0,
      originalUnitPrice: 0,
      discountApplied: false,
      addToDb: false,
      updatePriceInDb: false,
      isCustom: true
    }
  ]);

  const [customerName, setCustomerName] = useState('Consumidor Final');
  const [customerCuit, setCustomerCuit] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.EFECTIVO);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>(DeliveryMethod.RETIRO_LOCAL);
  const [advancePayment, setAdvancePayment] = useState<number>(0);
  const [notes, setNotes] = useState('');

  const [createdOrder, setCreatedOrder] = useState<OrderDto | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Check if cloning an existing order
  useEffect(() => {
    const clone = location.state?.cloneOrder as OrderDto | undefined;
    if (clone) {
      setOrderType(clone.orderType);
      setPaymentMethod(clone.paymentMethod);
      setDeliveryMethod(clone.deliveryMethod);
      setCustomerName(clone.customer.name || 'Consumidor Final');
      setCustomerCuit(clone.customer.cuitCuil || '');
      setCustomerEmail(clone.customer.email || '');
      setCustomerPhone(clone.customer.phone || '');
      setCustomerAddress(clone.customer.address || '');
      if (clone.advancePayment) setAdvancePayment(clone.advancePayment);
      if (clone.notes) setNotes(`[Clonada de #${clone.orderNumber}] ${clone.notes}`);

      if (clone.items && clone.items.length > 0) {
        setRows(
          clone.items.map((it, idx) => ({
            id: `clone-row-${idx}-${Date.now()}`,
            productId: it.productId,
            productName: it.productName,
            quantity: it.quantity,
            unitPrice: it.unitPrice,
            originalUnitPrice: it.originalUnitPrice || it.unitPrice,
            discountApplied: Boolean(it.discountApplied),
            addToDb: false,
            updatePriceInDb: false,
            isCustom: false
          }))
        );
      }
    }
  }, [location.state]);

  const subtotal = rows.reduce((acc, r) => acc + Math.round(r.unitPrice * r.quantity * 100) / 100, 0);
  const total = subtotal;
  const balance = Math.max(0, total - advancePayment);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRows = rows.filter((r) => r.productName.trim().length > 0);
    if (validRows.length === 0) {
      setErrorMessage('Debe agregar al menos un producto a la orden.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    const res = await orderService.createManualOrder({
      orderType,
      items: validRows.map((r) => ({
        productId: r.productId,
        productName: r.productName,
        quantity: r.quantity,
        unitPrice: r.unitPrice,
        originalUnitPrice: r.originalUnitPrice,
        discountApplied: r.discountApplied,
        addToDb: r.addToDb,
        updatePriceInDb: r.updatePriceInDb
      })),
      customer: {
        name: customerName,
        cuitCuil: customerCuit,
        email: customerEmail,
        phone: customerPhone,
        address: customerAddress
      },
      advancePayment,
      paymentMethod,
      deliveryMethod,
      deliveryAddress: customerAddress,
      notes
    });

    setSubmitting(false);

    if (res.success && res.data) {
      setCreatedOrder(res.data);
      setReceiptOpen(true);
    } else {
      setErrorMessage(res.message || 'Error al crear la orden manual.');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="p-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-white transition"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <ShoppingCart size={20} className="text-cyan-400" />
              <span>Creación Manual de Orden</span>
            </h1>
            <p className="text-xs text-slate-400">Emisión directa de pedidos y cotizaciones por staff</p>
          </div>
        </div>

        {/* Order Type Toggle */}
        <div className="flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setOrderType(OrderType.RETAIL)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              orderType === OrderType.RETAIL
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Minorista
          </button>
          <button
            type="button"
            onClick={() => setOrderType(OrderType.WHOLESALE)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              orderType === OrderType.WHOLESALE
                ? 'bg-cyan-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mayorista
          </button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl flex items-center gap-2 text-xs">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Interactive Products Table */}
        <div className="space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Artículos de la Orden</h2>
          <ManualOrderTable rows={rows} orderType={orderType} onChange={setRows} />
        </div>

        {/* Customer & Payment Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2.5">
              <User size={15} className="text-cyan-400" />
              <span>Datos del Cliente (Opcionales)</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">Nombre o Razón Social</label>
                <input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Consumidor Final"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">CUIT / CUIL / DNI</label>
                  <input
                    value={customerCuit}
                    onChange={(e) => setCustomerCuit(e.target.value)}
                    placeholder="20-12345678-9"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">Teléfono / WhatsApp</label>
                  <input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+54 9 260 4..."
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Email</label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="cliente@ejemplo.com"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Dirección de Entrega</label>
                <input
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  placeholder="Calle y número, San Rafael, Mendoza"
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Payment & Settlement Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 flex flex-col justify-between">
            <div className="space-y-3 text-xs">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-2.5">
                <CreditCard size={15} className="text-cyan-400" />
                <span>Condiciones de Pago y Entrega</span>
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-400 block mb-1">Método de Pago</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value={PaymentMethod.EFECTIVO}>Efectivo</option>
                    <option value={PaymentMethod.TRANSFERENCIA}>Transferencia Bancaria</option>
                    <option value={PaymentMethod.TARJETA_DEBITO}>Tarjeta de Débito</option>
                    <option value={PaymentMethod.TARJETA_CREDITO}>Tarjeta de Crédito</option>
                    <option value={PaymentMethod.CUENTA_CORRIENTE}>Cuenta Corriente</option>
                    <option value={PaymentMethod.OTRO}>Otro</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">Modalidad de Entrega</label>
                  <select
                    value={deliveryMethod}
                    onChange={(e) => setDeliveryMethod(e.target.value as DeliveryMethod)}
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value={DeliveryMethod.RETIRO_LOCAL}>Retiro en Local</option>
                    <option value={DeliveryMethod.ENVIO_DOMICILIO}>Envío a Domicilio</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Adelanto / Seña Recibida ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 font-mono">$</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(Math.max(0, parseFloat(e.target.value) || 0))}
                    placeholder="0.00"
                    className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 pl-7 text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Observaciones / Notas Internas</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Detalles sobre el despacho, preparación o embalaje..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            {/* Calculations Box */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal general:</span>
                <span className="font-mono text-white">${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1 border-t border-slate-800">
                <span>Total de la Orden:</span>
                <span className="font-mono text-cyan-400">${total.toLocaleString('es-AR')}</span>
              </div>
              {advancePayment > 0 && (
                <>
                  <div className="flex justify-between text-emerald-400">
                    <span>Adelanto pagado:</span>
                    <span className="font-mono">-${advancePayment.toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between font-bold text-rose-400 pt-1 border-t border-slate-800">
                    <span>Saldo pendiente:</span>
                    <span className="font-mono">${balance.toLocaleString('es-AR')}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-extrabold rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/10 transition disabled:opacity-50"
          >
            <CheckCircle size={18} />
            <span>{submitting ? 'Confirmando Orden...' : 'Confirmar y Emitir Orden'}</span>
          </button>
        </div>
      </form>

      {/* Confirmation & Printable Receipt Modal */}
      <OrderReceiptModal
        order={createdOrder}
        isOpen={receiptOpen}
        onClose={() => {
          setReceiptOpen(false);
          navigate('/orders');
        }}
      />
    </div>
  );
};

