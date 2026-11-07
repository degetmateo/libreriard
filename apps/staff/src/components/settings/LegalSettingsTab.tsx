import React, { useState } from 'react';
import { SettingsService } from '../../services/settings.service';
import { Save, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  initialTerms: string;
  initialPrivacy: string;
  onSaved: () => void;
}

export const LegalSettingsTab: React.FC<Props> = ({ initialTerms, initialPrivacy, onSaved }) => {
  const [terms, setTerms] = useState(initialTerms);
  const [privacy, setPrivacy] = useState(initialPrivacy);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const settingsService = new SettingsService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    const res = await settingsService.updateLegalTexts(terms, privacy);
    setLoading(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved();
    } else {
      setErrorMessage(res.message || 'Error al guardar textos legales.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saved && (
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg flex items-center gap-2 text-xs">
          <CheckCircle size={15} />
          <span>Términos, condiciones y políticas actualizados con éxito.</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg flex items-center gap-2 text-xs">
          <AlertTriangle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}
      <div>
        <label className="text-xs text-slate-400 font-medium block mb-1">
          Términos y Condiciones de Uso
        </label>
        <textarea
          required
          rows={8}
          value={terms}
          onChange={(e) => setTerms(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white font-mono leading-relaxed"
          placeholder="Escriba los términos y condiciones del sitio..."
        />
      </div>
      <div>
        <label className="text-xs text-slate-400 font-medium block mb-1">
          Política de Privacidad
        </label>
        <textarea
          required
          rows={8}
          value={privacy}
          onChange={(e) => setPrivacy(e.target.value)}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-white font-mono leading-relaxed"
          placeholder="Escriba las políticas de privacidad y protección de datos..."
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition hover:bg-cyan-300"
      >
        <Save size={14} />
        <span>{loading ? 'Guardando...' : 'Guardar Textos Legales'}</span>
      </button>
    </form>
  );
};

