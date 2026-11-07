import React, { useState } from 'react';
import { CustomerUserDto, CustomerWholesaleStatus } from '@libreriard/shared';
import { ProfileService } from '../../services/profile.service';
import { ShieldCheck, Clock, Send } from 'lucide-react';

export const WholesaleRequestBox: React.FC<{ user: CustomerUserDto; onRequested: () => void }> = ({ user, onRequested }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const profileService = new ProfileService();

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await profileService.requestWholesale(message);
    setLoading(false);
    if (res.success) {
      alert('¡Solicitud enviada con éxito! Los administradores revisarán tu perfil.');
      onRequested();
    } else {
      alert(res.message || 'Error al enviar la solicitud.');
    }
  };

  if (user.isWholesaleApproved) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center space-x-3 text-emerald-800">
        <ShieldCheck size={28} className="text-emerald-600 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Cuenta Mayorista Habilitada</h4>
          <p className="text-xs text-emerald-700">Disfrutas de precios mayoristas diferenciales en todo el catálogo de Librería Rubén Darío.</p>
        </div>
      </div>
    );
  }

  if (user.wholesaleStatus === CustomerWholesaleStatus.PENDING) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center space-x-3 text-amber-800">
        <Clock size={28} className="text-amber-600 shrink-0" />
        <div>
          <h4 className="font-bold text-sm">Solicitud Mayorista en Revisión</h4>
          <p className="text-xs text-amber-700">Tu solicitud ha sido enviada al equipo de administración y está pendiente de aprobación.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cyan-50/60 border border-cyan-200 rounded-2xl p-5 space-y-3">
      <div className="flex items-center space-x-2 text-cyan-900">
        <ShieldCheck size={20} className="text-cyan-600" />
        <h4 className="font-bold text-sm">¿Deseas comprar con Precios Mayoristas?</h4>
      </div>
      <p className="text-xs text-slate-600">
        Si eres un comercio, librería, institución educativa o revendedor, puedes enviar una solicitud para que nuestro equipo habilite tu cuenta con precios preferenciales de fábrica y distribución.
      </p>
      <form onSubmit={handleRequest} className="space-y-3">
        <textarea
          rows={2}
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Mensaje opcional para la administración (ej: rubro de tu negocio, volumen estimado)..."
          className="w-full bg-white border border-cyan-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-none focus:border-cyan-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 transition"
        >
          <Send size={14} />
          <span>{loading ? 'Enviando solicitud...' : 'Enviar Solicitud Mayorista'}</span>
        </button>
      </form>
    </div>
  );
};
