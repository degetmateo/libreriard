import React, { useState } from 'react';
import { BankTransferBox } from './BankTransferBox';
import { OrderService } from '../../services/order.service';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirmed: (receiptUrl: string, receiptName: string) => void;
}

export const TransferConfirmationModal: React.FC<Props> = ({ isOpen, onClose, onConfirmed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const orderService = new OrderService();

  if (!isOpen) return null;

  const handleUploadAndConfirm = async () => {
    if (!file) {
      setError('Debes adjuntar el comprobante de transferencia para confirmar el pedido.');
      return;
    }
    setError('');
    setUploading(true);
    const res = await orderService.uploadReceipt(file);
    setUploading(false);
    if (res.success && res.data) {
      onConfirmed(res.data.url, file.name);
    } else {
      setError(res.message || 'Error al subir el comprobante. Intenta nuevamente.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-900">Confirmación de Transferencia Bancaria</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1"><X size={18} /></button>
        </div>

        <BankTransferBox />

        <div className="space-y-2 pt-1">
          <label className="text-xs font-bold text-slate-800 block">
            Adjuntar Comprobante de Pago * (PDF, JPG, PNG)
          </label>
          <div className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-2xl p-4 text-center cursor-pointer transition bg-slate-50 relative">
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  setFile(e.target.files[0]);
                  setError('');
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center gap-1.5 pointer-events-none">
              <Upload size={22} className="text-cyan-600" />
              <span className="text-xs font-semibold text-slate-700">
                {file ? file.name : 'Haz clic para seleccionar o arrastra el comprobante'}
              </span>
              <span className="text-[11px] text-slate-400">Máximo 15 MB</span>
            </div>
          </div>
          {file && (
            <p className="text-xs text-emerald-600 flex items-center gap-1">
              <Check size={14} /> Archivo seleccionado: <strong>{file.name}</strong>
            </p>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleUploadAndConfirm}
            disabled={uploading || !file}
            className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 disabled:opacity-50 transition"
          >
            <span>{uploading ? 'Subiendo y Confirmando...' : 'Confirmar Pedido'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

