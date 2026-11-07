import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CatalogService } from '../services/catalog.service';
import { SEOHead } from '../components/common/SEOHead';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  const [privacy, setPrivacy] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const catalogService = new CatalogService();

  useEffect(() => {
    catalogService.getSettings().then((res) => {
      if (res.success && res.data) {
        setPrivacy(res.data.privacyPolicy || 'No se han establecido políticas de privacidad.');
      }
    }).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <SEOHead
        title="Política de Privacidad"
        canonicalPath="/privacy-policy"
        description="Conocé las políticas de privacidad y el tratamiento seguro de datos personales en Librería Rubén Darío General Pacheco."
      />
      <Link to="/" className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700 mb-6 transition">
        <ArrowLeft size={16} />
        <span>Volver a la tienda</span>
      </Link>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-xl">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">Política de Privacidad</h1>
            <p className="text-xs text-slate-500">Librería Rubén Darío</p>
          </div>
        </div>
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-sm">Cargando política de privacidad...</div>
        ) : (
          <div className="prose prose-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
            {privacy}
          </div>
        )}
      </div>
    </div>
  );
};

