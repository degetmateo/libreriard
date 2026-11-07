import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { UserPlus, CheckCircle, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '', cuitCuil: '', email: '', password: '', phone: '', address: '', postalCode: '', acceptTerms: false
  });
  const [error, setError] = useState('');
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.acceptTerms) {
      setError('Debes aceptar los Términos y Condiciones y la Política de Privacidad');
      return;
    }
    setError('');
    setLoading(true);
    const res = await register(formData);
    setLoading(false);
    if (res.success) setRegistered(true);
    else setError(res.message || 'Error al registrar la cuenta');
  };

  if (registered) {
    return (
      <div className="max-w-md mx-auto py-12 px-4">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900">¡Registro Exitoso!</h2>
          <p className="text-sm text-slate-600">
            Hemos enviado un enlace de activación a <strong>{formData.email}</strong>. Por favor revisa tu bandeja de entrada y haz clic en el enlace para activar tu cuenta antes de iniciar sesión.
          </p>
          <div className="pt-4">
            <Link to="/login" className="px-6 py-2.5 bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm inline-block">
              Ir a Iniciar Sesión
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-8 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-black text-slate-900">Crear Cuenta de Cliente</h2>
          <p className="text-xs text-slate-500 mt-1">Completa tus datos para realizar compras minoristas y mayoristas</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Nombre Completo o Razón Social *</label>
            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">CUIL / CUIT *</label>
              <input required placeholder="20-12345678-9" value={formData.cuitCuil} onChange={e => setFormData({ ...formData, cuitCuil: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm font-mono" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Teléfono (Opcional)</label>
              <input placeholder="11 2345-6789" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico *</label>
            <input type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Contraseña (Mínimo 6 caracteres) *</label>
            <input type="password" required minLength={6} value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-700 block mb-1">Dirección (Opcional)</label>
              <input placeholder="Calle y número" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">C.P.</label>
              <input placeholder="1406" value={formData.postalCode} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs sm:text-sm" />
            </div>
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={formData.acceptTerms}
                onChange={e => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="mt-0.5 rounded text-cyan-600 focus:ring-cyan-500 w-4 h-4 border-slate-300"
              />
              <span className="text-xs text-slate-600 leading-snug">
                Acepto los{' '}
                <Link to="/terms-and-conditions" target="_blank" className="text-cyan-600 font-bold underline hover:text-cyan-700">
                  Términos y Condiciones
                </Link>{' '}
                y la{' '}
                <Link to="/privacy-policy" target="_blank" className="text-cyan-600 font-bold underline hover:text-cyan-700">
                  Política de Privacidad
                </Link>
                .
              </span>
            </label>
          </div>

          <button type="submit" disabled={loading} className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition mt-3">
            <UserPlus size={16} />
            <span>{loading ? 'Registrando cuenta...' : 'Crear Cuenta'}</span>
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          ¿Ya tienes cuenta? <Link to="/login" className="text-cyan-600 font-bold hover:underline">Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};
