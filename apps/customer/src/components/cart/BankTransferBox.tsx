import React, { useEffect, useState } from 'react';
import { BankTransferDetailsDto } from '@libreriard/shared';
import { CatalogService } from '../../services/catalog.service';
import { Landmark, Copy } from 'lucide-react';

export const BankTransferBox: React.FC = () => {
  const [details, setDetails] = useState<BankTransferDetailsDto | null>(null);

  useEffect(() => {
    new CatalogService().getBankDetails().then(res => {
      if (res.success && res.data) setDetails(res.data.bankTransferDetails);
    });
  }, []);

  if (!details) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles: ' + text);
  };

  return (
    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-4 text-xs text-slate-800 space-y-2">
      <div className="flex items-center space-x-2 text-cyan-800 font-bold text-sm mb-1">
        <Landmark size={18} />
        <span>Datos para Transferencia Bancaria</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
        <div><strong>Banco:</strong> {details.bankName}</div>
        <div><strong>Titular:</strong> {details.accountHolder}</div>
        <div><strong>CUIT:</strong> {details.cuitCuil}</div>
        <div><strong>Tipo de Cuenta:</strong> {details.accountType}</div>
      </div>
      <div className="bg-white p-2.5 rounded-xl border border-cyan-200 flex items-center justify-between">
        <div><span className="text-[10px] text-slate-400 block uppercase font-bold">CBU</span><span className="font-mono font-bold text-slate-900">{details.cbu}</span></div>
        <button onClick={() => copyToClipboard(details.cbu)} className="text-cyan-700 hover:text-cyan-900 p-1" title="Copiar CBU"><Copy size={16} /></button>
      </div>
      <div className="bg-white p-2.5 rounded-xl border border-cyan-200 flex items-center justify-between">
        <div><span className="text-[10px] text-slate-400 block uppercase font-bold">Alias CBU</span><span className="font-mono font-bold text-cyan-700">{details.alias}</span></div>
        <button onClick={() => copyToClipboard(details.alias)} className="text-cyan-700 hover:text-cyan-900 p-1" title="Copiar Alias"><Copy size={16} /></button>
      </div>
      {details.notes && <p className="text-[11px] text-slate-500 italic mt-1">{details.notes}</p>}
    </div>
  );
};

