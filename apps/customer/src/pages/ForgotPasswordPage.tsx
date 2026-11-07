import React, { useState } from 'react';
import { CustomerAuthService } from '../services/customer-auth.service';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new CustomerAuthService().forgotPassword(email);
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xl">
        {sent ? (
          <>
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Enlace Enviado</h2>
            <p className="text-xs text-slate-600">
              Si tu correo está registrado en nuestro sistema, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
            </p>
            <div className="pt-4">
              <Link to="/login" className="text-xs text-cyan-600 font-bold hover:underline">Volver a Iniciar Sesión</Link>
            </div>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-cyan-100 text-cyan-700 rounded-full flex items-center justify-center mx-auto">
              <Mail size={24} />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Recuperar Contraseña</h2>
            <p className="text-xs text-slate-500">Ingresa tu correo electrónico y te enviaremos las instrucciones de recuperación.</p>
            <form onSubmit={handleSubmit} className="space-y-4 text-left pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold rounded-xl text-sm transition"
              >
                {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              </button>
            </form>
            <div className="pt-2">
              <Link to="/login" className="text-xs text-slate-500 hover:text-slate-800">Volver a Iniciar Sesión</Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

