import React, { useState } from 'react';
import { ProductService } from '../../services/product.service';
import { Modal } from '../common/Modal';
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ExcelImportModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ total: number; created: number; updated: number; errors: string[] } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const productService = new ProductService();

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setError(null);
    setResult(null);

    const res = await productService.importExcel(file);
    setLoading(false);

    if (res.success && res.data) {
      setResult(res.data);
      onSuccess();
    } else {
      setError(res.message || 'Error al importar archivo Excel');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importar / Actualizar Catálogo desde Excel">
      <form onSubmit={handleUpload} className="space-y-4 text-xs">
        <p className="text-slate-400 leading-relaxed">
          Sube un archivo <strong className="text-white">.xlsx</strong> o <strong className="text-white">.csv</strong> con las columnas del catálogo (ID, Código de Barras, Nombre, Precios, etc.). Si los productos ya existen por ID o Código, sus precios y datos serán actualizados en la base de datos.
        </p>

        <div className="border-2 border-dashed border-slate-700 hover:border-cyan-500 rounded-xl p-6 text-center transition bg-slate-900/50">
          <input
            type="file"
            accept=".xlsx, .xls, .csv"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="hidden"
            id="excel-file-input"
          />
          <label htmlFor="excel-file-input" className="cursor-pointer flex flex-col items-center gap-2">
            <FileSpreadsheet size={32} className="text-cyan-400" />
            <span className="font-semibold text-white">
              {file ? file.name : 'Haz clic para seleccionar el archivo Excel (.xlsx / .csv)'}
            </span>
            <span className="text-[11px] text-slate-500">Tamaño máximo recomendado: 20MB</span>
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
              <span>Importación finalizada con éxito</span>
            </div>
            <p className="text-[11px] text-slate-300">
              {result.created} productos nuevos creados • {result.updated} productos existentes actualizados.
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
            <span>{loading ? 'Procesando...' : 'Iniciar Importación'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};

