import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CatalogService } from '../services/catalog.service';
import { FileText, ArrowLeft } from 'lucide-react';

export const TermsPage: React.FC = () => {
  const [terms, setTerms] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const catalogService = new CatalogService();

  useEffect(() => {
    catalogService.getSettings().then((res) => {
      if (res.success && res.data) {
        setTerms(res.data.termsAndConditions || 'No se han establecido términos y condiciones.');
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700 mb-6 transition">
        <ArrowLeft size={16} />
        <span>Volver a la tienda</span>
      </Link>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-xl">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Términos y Condiciones</h1>
            <p className="text-xs text-slate-500">Librería Rubén Darío</p>
          </div>
        </div>
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Cargando términos y condiciones...</div>
        ) : (
          <div className="prose prose-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {terms}
          </div>
        )}
      </div>
    </div>
  );
};

