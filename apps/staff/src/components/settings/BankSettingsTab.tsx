import React, { useState } from 'react';
import { BankTransferDetailsDto } from '@libreriard/shared';
import { SettingsService } from '../../services/settings.service';
import { Save, CheckCircle, AlertTriangle } from 'lucide-react';

export const BankSettingsTab: React.FC<{ initialData: BankTransferDetailsDto; onSaved: () => void }> = ({ initialData, onSaved }) => {
  const [details, setDetails] = useState<BankTransferDetailsDto>(initialData);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const settingsService = new SettingsService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    const res = await settingsService.updateBankDetails(details);
    setLoading(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved();
    } else {
      setErrorMessage(res.message || 'Error al guardar datos bancarios.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saved && <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg flex items-center gap-2 text-xs"><CheckCircle size={15} /><span>Datos bancarios guardados.</span></div>}
      {errorMessage && <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg flex items-center gap-2 text-xs"><AlertTriangle size={15} /><span>{errorMessage}</span></div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div><label className="text-xs text-slate-400 font-medium">Banco</label><input required value={details.bankName} onChange={e => setDetails({ ...details, bankName: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" /></div>
        <div><label className="text-xs text-slate-400 font-medium">Titular</label><input required value={details.accountHolder} onChange={e => setDetails({ ...details, accountHolder: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" /></div>
        <div><label className="text-xs text-slate-400 font-medium">CUIT / CUIL</label><input required value={details.cuitCuil} onChange={e => setDetails({ ...details, cuitCuil: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white font-mono" /></div>
        <div><label className="text-xs text-slate-400 font-medium">Tipo de Cuenta</label><input required value={details.accountType} onChange={e => setDetails({ ...details, accountType: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" /></div>
        <div><label className="text-xs text-slate-400 font-medium">CBU (22 dígitos)</label><input required maxLength={22} value={details.cbu} onChange={e => setDetails({ ...details, cbu: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono text-white" /></div>
        <div><label className="text-xs text-slate-400 font-medium">Alias CBU</label><input required value={details.alias} onChange={e => setDetails({ ...details, alias: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs font-mono text-cyan-400 uppercase" /></div>
      </div>
      <div><label className="text-xs text-slate-400 font-medium">Instrucciones</label><textarea rows={2} value={details.notes} onChange={e => setDetails({ ...details, notes: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" /></div>
      <button type="submit" disabled={loading} className="px-4 py-2 bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5"><Save size={14} /><span>{loading ? 'Guardando...' : 'Guardar Datos Bancarios'}</span></button>
    </form>
  );
};

