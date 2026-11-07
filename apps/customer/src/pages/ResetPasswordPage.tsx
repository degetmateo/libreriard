import React, { useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { CustomerAuthService } from '../services/customer-auth.service';
import { KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Falta el token de recuperación en el enlace.');
      return;
    }
    setError('');
    setLoading(true);
    const res = await new CustomerAuthService().resetPassword(token, newPassword);
    setLoading(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setError(res.message || 'Error al restablecer la contraseña.');
    }
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-4">
        <div className="text-center">
          <div className="w-12 h-12 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center mx-auto mb-2">
            <KeyRound size={24} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Nueva Contraseña</h2>
          <p className="text-xs text-slate-500">Ingresa tu nueva contraseña para acceder a tu cuenta.</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="text-center space-y-2 py-4">
            <CheckCircle2 size={32} className="text-emerald-500 mx-auto" />
            <p className="text-sm font-bold text-slate-800">¡Contraseña restablecida con éxito!</p>
            <p className="text-xs text-slate-500">Redirigiéndote a la pantalla de inicio de sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Nueva Contraseña (mínimo 6 caracteres)</label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-sm transition"
            >
              {loading ? 'Guardando...' : 'Cambiar Contraseña'}
            </button>
          </form>
        )}

        <div className="text-center pt-2">
          <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800">Volver a Iniciar Sesión</Link>
        </div>
      </div>
    </div>
  );
};
