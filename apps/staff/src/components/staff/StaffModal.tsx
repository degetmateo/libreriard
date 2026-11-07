import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { StaffRole, CreateStaffDto } from '@libreriard/shared';
import { StaffService } from '../../services/staff.service';

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const StaffModal: React.FC<StaffModalProps> = ({ isOpen, onClose, onCreated }) => {
  const [formData, setFormData] = useState<CreateStaffDto>({
    name: '', email: '', password: '', role: StaffRole.EMPLOYEE
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const staffService = new StaffService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await staffService.createStaff(formData);
    setLoading(false);
    if (res.success) {
      onCreated();
      onClose();
    } else {
      setError(res.message || 'Error al crear miembro del staff');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Crear Miembro del Staff">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">{error}</div>}
        <div>
          <label className="text-xs text-slate-400 font-medium">Nombre Completo</label>
          <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium">Correo Electrónico</label>
          <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium">Contraseña Inicial</label>
          <input type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium">Rol y Jerarquía</label>
          <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value as StaffRole })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white">
            <option value={StaffRole.EMPLOYEE}>Empleado</option>
            <option value={StaffRole.ADMIN}>Administrador</option>
          </select>
        </div>
        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs">Cancelar</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs">{loading ? 'Guardando...' : 'Crear Staff'}</button>
        </div>
      </form>
    </Modal>
  );
};

