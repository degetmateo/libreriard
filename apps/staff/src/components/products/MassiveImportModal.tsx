import React, { useState } from 'react';
import { ProductService } from '../../services/product.service';
import { Modal } from '../common/Modal';
import { Layers, Upload, CheckCircle, AlertTriangle, FileCode, BookOpen } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const MassiveImportModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ total: number; inserted: number; updated: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const productService = new ProductService();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const res = await productService.importMassive(file);
    setLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
      onSuccess();
    } else {
      setError(res.message || 'Error al procesar la carga masiva.');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Carga Masiva de Productos (JSON / XLSX / CSV)" maxWidth="max-w-xl">
      <form onSubmit={handleUpload} className="space-y-4 text-xs">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2 text-slate-300">
          <div className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Layers size={15} />
            <span>Formato Masivo Optimizado</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-400">
            Diseñado para importar miles de artículos en un solo lote. Acepta archivos <strong className="text-white">.json</strong> (array de productos) o planillas <strong className="text-white">.xlsx / .csv</strong>.
          </p>
          <div className="flex items-center gap-2 pt-1 text-[11px] text-cyan-400">
            <BookOpen size={13} />
            <span>Consulta el archivo <code className="text-white font-mono bg-slate-950 px-1 py-0.5 rounded">BULK_PRODUCT_IMPORT_SPEC.md</code> para ver la especificación completa y ejemplos JSON.</span>
          </div>
        </div>

        <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-6 text-center transition bg-slate-900/50">
          <input
            type="file"
            accept=".json, .xlsx, .csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="massive-file-input"
          />
          <label htmlFor="massive-file-input" className="cursor-pointer flex flex-col items-center gap-2">
            <FileCode size={32} className="text-cyan-400" />
            <span className="font-semibold text-white">
              {file ? file.name : 'Seleccionar archivo masivo (.json, .xlsx, .csv)'}
            </span>
            <span className="text-[11px] text-slate-500">Soporta miles de productos por lote</span>
          </label>
        </div>

        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg flex items-center gap-2">
            <AlertTriangle size={15} />
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg space-y-1">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle size={15} />
              <span>Carga masiva procesada con éxito</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Total procesado: {result.total} • Nuevos: {result.inserted} • Actualizados: {result.updated}
            </p>
            {result.errors.length > 0 && (
              <div className="mt-2 text-[10px] text-amber-300 max-h-24 overflow-y-auto">
                <span className="font-bold">Avisos ({result.errors.length}):</span>
                {result.errors.slice(0, 5).map((err, i) => (
                  <p key={i}>• {err}</p>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 hover:text-white rounded-lg font-semibold"
          >
            Cerrar
          </button>
          <button
            type="submit"
            disabled={!file || loading}
            className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-lg flex items-center gap-1.5 disabled:opacity-40 transition"
          >
            <Upload size={14} />
            <span>{loading ? 'Procesando masivamente...' : 'Comenzar Carga Masiva'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

