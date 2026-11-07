import React, { useEffect, useState } from 'react';
import { CustomerUserDto } from '@libreriard/shared';
import { CustomerService } from '../services/customer.service';
import { Badge } from '../components/common/Badge';
import { Search, CheckCircle, XCircle } from 'lucide-react';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerUserDto[]>([]);
  const [search, setSearch] = useState('');
  const [wholesaleOnly, setWholesaleOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const customerService = new CustomerService();

  const loadCustomers = async () => {
    setLoading(true);
    const res = await customerService.getCustomers({ search, wholesalePendingOnly: wholesaleOnly, limit: 50 });
    if (res.success && res.data) setCustomers(res.data);
    setLoading(false);
  };

  useEffect(() => { loadCustomers(); }, [search, wholesaleOnly]);

  const handleReviewWholesale = async (id: string, approved: boolean) => {
    if (confirm(`¿Está seguro de ${approved ? 'APROBAR' : 'RECHAZAR'} a este cliente como Mayorista?`)) {
      await customerService.reviewWholesale(id, approved);
      loadCustomers();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, CUIT o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <button
          onClick={() => setWholesaleOnly(!wholesaleOnly)}
          className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${wholesaleOnly ? 'bg-amber-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-300'}`}
        >
          {wholesaleOnly ? 'Mostrando Solicitudes Mayoristas' : 'Ver Solicitudes Mayoristas'}
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">Cliente / Razón Social</th>
              <th className="p-3">CUIT/CUIL</th>
              <th className="p-3">Email</th>
              <th className="p-3">Mayorista</th>
              <th className="p-3">Mensaje</th>
              <th className="p-3 text-right">Acción Mayorista</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Cargando clientes...</td></tr>
            ) : customers.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">No se encontraron clientes.</td></tr>
            ) : customers.map(c => (
              <tr key={c.id} className="hover:bg-slate-900/40">
                <td className="p-3 font-semibold text-white">{c.name}</td>
                <td className="p-3 font-mono text-xs">{c.cuitCuil}</td>
                <td className="p-3 text-xs text-slate-400">{c.email}</td>
                <td className="p-3">
                  <Badge
                    label={c.isWholesaleApproved ? 'APROBADO' : c.wholesaleStatus === 'PENDING' ? 'SOLICITADO' : 'MINORISTA'}
                    variant={c.isWholesaleApproved ? 'green' : c.wholesaleStatus === 'PENDING' ? 'amber' : 'slate'}
                  />
                </td>
                <td className="p-3 text-xs text-slate-400 max-w-xs truncate">{c.wholesaleMessage || '-'}</td>
                <td className="p-3 text-right space-x-2">
                  {c.wholesaleStatus === 'PENDING' && (
                    <>
                      <button onClick={() => handleReviewWholesale(c.id, true)} className="text-emerald-400 hover:text-emerald-300 p-1" title="Aprobar"><CheckCircle size={18} /></button>
                      <button onClick={() => handleReviewWholesale(c.id, false)} className="text-rose-400 hover:text-rose-300 p-1" title="Rechazar"><XCircle size={18} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
