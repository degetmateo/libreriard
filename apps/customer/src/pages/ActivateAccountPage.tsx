import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CustomerAuthService } from '../services/customer-auth.service';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export const ActivateAccountPage: React.FC = () => {
  const location = useLocation();
  const token = new URLSearchParams(location.search).get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('No se encontró el token de activación en el enlace.');
      return;
    }

    new CustomerAuthService().activateAccount(token).then(res => {
      if (res.success) {
        setStatus('success');
        setMessage(res.message || '¡Tu cuenta ha sido activada con éxito!');
      } else {
        setStatus('error');
        setMessage(res.message || 'El enlace de activación es inválido o ha expirado.');
      }
    }).catch(() => {
      setStatus('error');
      setMessage('Error de conexión al activar la cuenta.');
    });
  }, [token]);

  return (
    <div className="max-w-md mx-auto py-16 px-4">
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center space-y-4 shadow-xl">
        {status === 'loading' && (
          <p className="text-sm text-slate-500">Activando tu cuenta, por favor espera...</p>
        )}
        {status === 'success' && (
          <>
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">¡Cuenta Activada!</h2>
            <p className="text-sm text-slate-600">{message}</p>
            <div className="pt-4">
              <Link to="/login" className="px-6 py-2.5 bg-cyan-400 text-slate-950 font-bold rounded-xl text-sm inline-block">
                Iniciar Sesión
              </Link>
            </div>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle size={32} />
            </div>
            <h2 className="text-2xl font-black text-slate-900">Error de Activación</h2>
            <p className="text-sm text-rose-600">{message}</p>
            <div className="pt-4">
              <Link to="/login" className="px-6 py-2.5 bg-slate-800 text-white font-bold rounded-xl text-sm inline-block">
                Volver al Inicio
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
