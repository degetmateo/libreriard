import React, { useEffect, useState } from 'react';
import { CustomerUserDto } from '@libreriard/shared';
import { CustomerService } from '../services/customer.service';
import { useAuth } from '../context/AuthContext';
import { CustomerEditModal } from '../components/customers/CustomerEditModal';
import { Badge } from '../components/common/Badge';
import { Search, CheckCircle, XCircle, Edit2, Key, Power } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerUserDto[]>([]);
  const [search, setSearch] = useState('');
  const [wholesaleOnly, setWholesaleOnly] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerUserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { isAdmin } = useAuth();
  const customerService = new CustomerService();

  const loadCustomers = async () => {
    setLoading(true);
    const res = await customerService.getCustomers({ search, wholesalePendingOnly: wholesaleOnly, limit: 50 });
    if (res.success && res.data) setCustomers(res.data);
    setLoading(false);
  };

  useEffect(() => { loadCustomers(); }, [search, wholesaleOnly]);

  const handleReviewWholesale = async (id: string, approved: boolean) => {
    if (confirm(`¿${approved ? 'APROBAR' : 'RECHAZAR'} solicitud mayorista?`)) {
      await customerService.reviewWholesale(id, approved);
      loadCustomers();
    }
  };

  const handleToggleActive = async (id: string) => {
    await customerService.toggleActive(id);
    loadCustomers();
  };

  const handleResetPassword = async (id: string, name: string) => {
    const newPass = prompt(`Ingrese la nueva contraseña para el cliente "${name}":`);
    if (newPass && newPass.length >= 6) {
      const res = await customerService.resetPassword(id, newPass);
      alert(res.message || 'Contraseña actualizada');
    } else if (newPass) {
      alert('La contraseña debe tener al menos 6 caracteres.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input type="text" placeholder="Buscar por nombre, CUIT o email..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400" />
        </div>
        <button onClick={() => setWholesaleOnly(!wholesaleOnly)} className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${wholesaleOnly ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}>
          {wholesaleOnly ? 'Mostrando Solicitudes Mayoristas' : 'Ver Solicitudes Mayoristas'}
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">Cliente</th>
              <th className="p-3">CUIT/CUIL</th>
              <th className="p-3">Mayorista</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? <tr><td colSpan={5} className="p-8 text-center text-slate-500">Cargando clientes...</td></tr> : customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-900/40">
                <td className="p-3"><p className="font-semibold text-white">{c.name}</p><p className="text-xs text-slate-500">{c.email}</p></td>
                <td className="p-3 font-mono text-xs">{c.cuitCuil}</td>
                <td className="p-3"><Badge label={c.isWholesaleApproved ? 'MAYORISTA' : c.wholesaleStatus === 'PENDING' ? 'SOLICITADO' : 'MINORISTA'} variant={c.isWholesaleApproved ? 'green' : c.wholesaleStatus === 'PENDING' ? 'amber' : 'slate'} /></td>
                <td className="p-3"><Badge label={c.isActive ? 'Activo' : 'Inactivo'} variant={c.isActive ? 'green' : 'slate'} /></td>
                <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                  {c.wholesaleStatus === 'PENDING' && (
                    <>
                      <button onClick={() => handleReviewWholesale(c.id, true)} className="text-emerald-400 hover:text-emerald-300 p-1" title="Aprobar Mayorista"><CheckCircle size={16} /></button>
                      <button onClick={() => handleReviewWholesale(c.id, false)} className="text-rose-400 hover:text-rose-300 p-1" title="Rechazar Mayorista"><XCircle size={16} /></button>
                    </>
                  )}
                  {isAdmin && (
                    <>
                      <button onClick={() => setSelectedCustomer(c)} className="text-slate-400 hover:text-cyan-400 p-1" title="Editar"><Edit2 size={16} /></button>
                      <button onClick={() => handleResetPassword(c.id, c.name)} className="text-slate-400 hover:text-amber-400 p-1" title="Restablecer Clave"><Key size={16} /></button>
                      <button onClick={() => handleToggleActive(c.id)} className="text-slate-400 hover:text-white p-1" title="Activar/Desactivar"><Power size={16} className={c.isActive ? 'text-emerald-400' : 'text-slate-500'} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CustomerEditModal customer={selectedCustomer} isOpen={Boolean(selectedCustomer)} onClose={() => setSelectedCustomer(null)} onSaved={loadCustomers} />
    </div>
  );
};
