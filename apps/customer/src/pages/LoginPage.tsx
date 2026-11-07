import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { SEOHead } from '../components/common/SEOHead';
import { LogIn, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const redirectUrl = new URLSearchParams(location.search).get('redirect') || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (res.success) {
      navigate(redirectUrl);
    } else {
      setError(res.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4">
      <SEOHead title="Iniciar Sesión" canonicalPath="/login" noIndex={true} />
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        <div className="text-center">
          <img src="/logo.png" alt="Librería Rubén Darío" width={56} height={56} className="w-14 h-14 object-contain mx-auto mb-2" />
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Iniciar Sesión</h2>
          <p className="text-xs text-slate-500 mt-1">Ingresa a tu cuenta para comprar y gestionar tus pedidos</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="text-xs font-bold text-slate-700">Contraseña</label>
              <Link to="/forgot-password" className="text-xs text-cyan-600 hover:underline">¿Olvidaste tu clave?</Link>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center space-x-2 transition"
          >
            <LogIn size={16} />
            <span>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            ¿Aún no tienes una cuenta?{' '}
            <Link to="/register" className="text-cyan-600 font-bold hover:underline">Regístrate aquí</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

