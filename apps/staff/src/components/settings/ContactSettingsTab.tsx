import React, { useState } from 'react';
import { FooterContactDto } from '@libreriard/shared';
import { SettingsService } from '../../services/settings.service';
import { Save, CheckCircle, AlertTriangle } from 'lucide-react';

interface Props {
  initialData: FooterContactDto;
  onSaved: () => void;
}

export const ContactSettingsTab: React.FC<Props> = ({ initialData, onSaved }) => {
  const [contact, setContact] = useState<FooterContactDto>(initialData);
  const [saved, setSaved] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const settingsService = new SettingsService();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);
    const res = await settingsService.updateFooterContact(contact);
    setLoading(false);
    if (res.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      onSaved();
    } else {
      setErrorMessage(res.message || 'Error al actualizar información de contacto.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {saved && (
        <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-lg flex items-center gap-2 text-xs">
          <CheckCircle size={15} />
          <span>Información de contacto y pie de página guardada.</span>
        </div>
      )}
      {errorMessage && (
        <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-lg flex items-center gap-2 text-xs">
          <AlertTriangle size={15} />
          <span>{errorMessage}</span>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <label className="text-xs text-slate-400 font-medium">Dirección Física</label>
          <input
            required
            value={contact.address}
            onChange={(e) => setContact({ ...contact, address: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
            placeholder="Ej: Av. San Martín 1234, San Rafael, Mendoza"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-slate-400 font-medium">Enlace a Google Maps</label>
          <input
            required
            value={contact.googleMapsUrl}
            onChange={(e) => setContact({ ...contact, googleMapsUrl: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
            placeholder="https://maps.google.com/?q=..."
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium">Horario de Atención</label>
          <input
            required
            value={contact.schedule}
            onChange={(e) => setContact({ ...contact, schedule: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
            placeholder="Lunes a Viernes 8:30 a 12:30 y 16:30 a 20:30"
          />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium">Teléfono / WhatsApp</label>
          <input
            required
            value={contact.phone}
            onChange={(e) => setContact({ ...contact, phone: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
            placeholder="+54 9 260 4123456"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs text-slate-400 font-medium">Correo Electrónico de Contacto</label>
          <input
            required
            type="email"
            value={contact.email}
            onChange={(e) => setContact({ ...contact, email: e.target.value })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white"
            placeholder="contacto@libreriard.com.ar"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={loading}
        className="px-4 py-2 bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 transition hover:bg-cyan-300"
      >
        <Save size={14} />
        <span>{loading ? 'Guardando...' : 'Guardar Información de Contacto'}</span>
      </button>
    </form>
  );
};

