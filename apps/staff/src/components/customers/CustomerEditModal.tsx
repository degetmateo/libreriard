import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { CustomerUserDto, AdminUpdateCustomerDto } from '@libreriard/shared';
import { CustomerService } from '../../services/customer.service';

interface CustomerEditModalProps {
  customer: CustomerUserDto | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
}

export const CustomerEditModal: React.FC<CustomerEditModalProps> = ({ customer, isOpen, onClose, onSaved }) => {
  const [formData, setFormData] = useState<AdminUpdateCustomerDto>({
    name: '', cuitCuil: '', email: '', phone: '', address: '', postalCode: '', isActive: true, isWholesaleApproved: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const customerService = new CustomerService();

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name, cuitCuil: customer.cuitCuil, email: customer.email,
        phone: customer.phone || '', address: customer.address || '', postalCode: customer.postalCode || '',
        isActive: customer.isActive, isWholesaleApproved: customer.isWholesaleApproved
      });
    }
  }, [customer, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;
    setError('');
    setLoading(true);
    const res = await customerService.updateCustomer(customer.id, formData);
    setLoading(false);
    if (res.success) { onSaved(); onClose(); } else { setError(res.message || 'Error al actualizar'); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar Datos del Cliente">
      <form onSubmit={handleSubmit} className="space-y-3.5">
        {error && <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">{error}</div>}
        <div><label className="text-xs text-slate-400 font-medium">Nombre / Razón Social</label><input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="text-xs text-slate-400 font-medium">CUIT / CUIL</label><input required value={formData.cuitCuil} onChange={e => setFormData({ ...formData, cuitCuil: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white font-mono" /></div>
          <div><label className="text-xs text-slate-400 font-medium">Teléfono</label><input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" /></div>
        </div>
        <div><label className="text-xs text-slate-400 font-medium">Correo Electrónico</label><input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" /></div>
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2"><label className="text-xs text-slate-400 font-medium">Dirección</label><input value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" /></div>
          <div><label className="text-xs text-slate-400 font-medium">C. Postal</label><input value={formData.postalCode} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" /></div>
        </div>
        <div className="flex gap-4 pt-1">
          <label className="text-xs text-slate-300 font-medium flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} className="rounded bg-slate-800 border-slate-700 text-cyan-400" />
            <span>Cuenta Activa</span>
          </label>
          <label className="text-xs text-slate-300 font-medium flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={formData.isWholesaleApproved} onChange={e => setFormData({ ...formData, isWholesaleApproved: e.target.checked })} className="rounded bg-slate-800 border-slate-700 text-cyan-400" />
            <span>Cliente Mayorista Aprobado</span>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs">{loading ? 'Guardando...' : 'Guardar Cambios'}</button>
        </div>
      </form>
    </Modal>
  );
};

