import React, { useEffect, useState } from 'react';
import { BankTransferDetailsDto } from '@libreriard/shared';
import { SettingsService } from '../services/settings.service';
import { Save, CheckCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [details, setDetails] = useState<BankTransferDetailsDto>({
    bankName: '', accountHolder: '', cuitCuil: '', cbu: '', alias: '', accountType: '', notes: ''
  });
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const settingsService = new SettingsService();

  useEffect(() => {
    settingsService.getSettings().then(res => {
      if (res.success && res.data) setDetails(res.data.bankTransferDetails);
    }).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(false);
    const res = await settingsService.updateBankDetails(details);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando configuración...</div>;

  return (
    <div className="max-w-2xl bg-slate-950 border border-slate-800 rounded-xl p-6">
      <h3 className="text-base font-bold text-white mb-1">Datos para Transferencias Bancarias</h3>
      <p className="text-xs text-slate-400 mb-6">Esta información se mostrará a los clientes al momento de finalizar una compra con método de pago TRANSFERENCIA.</p>

      {saved && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg flex items-center space-x-2 text-xs">
          <CheckCircle size={16} /> <span>Datos bancarios guardados correctamente.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-medium">Banco</label>
            <input required value={details.bankName} onChange={e => setDetails({ ...details, bankName: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Titular de la Cuenta</label>
            <input required value={details.accountHolder} onChange={e => setDetails({ ...details, accountHolder: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">CUIT / CUIL</label>
            <input required value={details.cuitCuil} onChange={e => setDetails({ ...details, cuitCuil: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Tipo de Cuenta</label>
            <input required value={details.accountType} onChange={e => setDetails({ ...details, accountType: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">CBU (22 dígitos)</label>
            <input required maxLength={22} value={details.cbu} onChange={e => setDetails({ ...details, cbu: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Alias CBU</label>
            <input required value={details.alias} onChange={e => setDetails({ ...details, alias: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm font-mono text-cyan-400 uppercase" />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium">Instrucciones Adicionales</label>
          <textarea rows={3} value={details.notes} onChange={e => setDetails({ ...details, notes: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2.5 text-sm text-white" placeholder="Ej: Enviar comprobante por WhatsApp con número de orden..." />
        </div>
        <button type="submit" className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg text-sm flex items-center space-x-2 transition">
          <Save size={16} /> <span>Guardar Cambios</span>
        </button>
      </form>
    </div>
  );
};
