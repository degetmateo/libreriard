import React, { useEffect, useState } from 'react';
import { StaffUserDto, StaffRole } from '@libreriard/shared';
import { StaffService } from '../services/staff.service';
import { useConfirm } from '../context/ConfirmContext';
import { StaffModal } from '../components/staff/StaffModal';
import { Badge } from '../components/common/Badge';
import { Plus, Key, Trash2 } from 'lucide-react';

export const StaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<StaffUserDto[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const staffService = new StaffService();
  const { confirm, prompt, alert } = useConfirm();

  const loadStaff = async () => {
    setLoading(true);
    const res = await staffService.getStaffList();
    if (res.success && res.data) setStaffList(res.data);
    setLoading(false);
  };

  useEffect(() => { loadStaff(); }, []);

  const handleResetPassword = async (id: string, name: string) => {
    const newPass = await prompt({
      title: 'Restablecer Contraseña',
      message: `Ingrese la nueva contraseña de acceso para "${name}":`,
      placeholder: 'Mínimo 6 caracteres...',
      inputType: 'password',
      confirmText: 'Guardar Contraseña',
      cancelText: 'Cancelar',
      validate: (val) => val.trim().length >= 6 ? null : 'La contraseña debe tener al menos 6 caracteres.'
    });

    if (newPass) {
      const res = await staffService.resetPassword(id, newPass.trim());
      await alert({
        title: res.success ? 'Contraseña Actualizada' : 'Error',
        message: res.message || 'La contraseña ha sido actualizada.',
        variant: res.success ? 'success' : 'danger'
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const ok = await confirm({
      title: '¿Eliminar miembro de staff?',
      message: `¿Está seguro de eliminar al miembro "${name}"?\nEsta acción no se puede deshacer.`,
      confirmText: 'Eliminar Miembro',
      cancelText: 'Cancelar',
      variant: 'danger'
    });
    if (ok) {
      await staffService.deleteStaff(id);
      loadStaff();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-slate-300">Equipo de Staff y Jerarquías</h3>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm flex items-center space-x-2 transition"
        >
          <Plus size={16} /> <span>Nuevo Miembro</span>
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">Email</th>
              <th className="p-3">Rol</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr><td colSpan={5} className="p-8 text-center text-slate-500">Cargando staff...</td></tr>
            ) : staffList.map(s => (
              <tr key={s.id} className="hover:bg-slate-900/40">
                <td className="p-3 font-semibold text-white">{s.name}</td>
                <td className="p-3 text-xs text-slate-400">{s.email}</td>
                <td className="p-3">
                  <Badge label={s.role} variant={s.role === StaffRole.ADMIN ? 'cyan' : 'slate'} />
                </td>
                <td className="p-3">
                  <Badge label={s.isActive ? 'Activo' : 'Inactivo'} variant={s.isActive ? 'green' : 'slate'} />
                </td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => handleResetPassword(s.id, s.name)} className="text-slate-400 hover:text-amber-400 p-1" title="Restablecer Contraseña"><Key size={16} /></button>
                  <button onClick={() => handleDelete(s.id, s.name)} className="text-slate-400 hover:text-rose-400 p-1" title="Eliminar"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <StaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onCreated={loadStaff} />
    </div>
  );
};

