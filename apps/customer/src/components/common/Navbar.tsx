import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Menu, X, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

export const Navbar: React.FC = () => {
  const { user, isWholesale, logout } = useAuth();
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40 text-slate-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          <img src="/logo.png" alt="Librería Rubén Darío" width={40} height={40} className="w-10 h-10 object-contain drop-shadow" />
          <div>
            <span className="font-extrabold text-base tracking-tight text-white block">Librería Rubén Darío</span>
            <span className="text-[11px] text-cyan-400 font-semibold tracking-wider uppercase block">Escolar • Comercial • Artística</span>
          </div>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition">Catálogo</Link>
          {isWholesale && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-bold">
              <ShieldCheck size={14} /> <span>Cliente Mayorista</span>
            </span>
          )}
          <Link to="/cart" className="relative p-2 text-slate-300 hover:text-cyan-400 transition">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-400 text-slate-950 text-xs font-extrabold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          {user ? (
            <div className="flex items-center space-x-3">
              <Link to="/profile" className="text-sm font-medium text-slate-200 hover:text-cyan-400 flex items-center space-x-1">
                <User size={16} /> <span>{user.name}</span>
              </Link>
              <button onClick={logout} className="text-xs text-rose-400 hover:underline">Salir</button>
            </div>
          ) : (
            <Link to="/login" className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm transition">
              Iniciar Sesión
            </Link>
          )}
        </div>

        <div className="flex md:hidden items-center space-x-3">
          <Link to="/cart" className="relative p-2 text-slate-300">
            <ShoppingCart size={22} />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyan-400 text-slate-950 text-xs font-extrabold rounded-full w-5 h-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-300">
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-slate-800 p-4 space-y-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-300">Catálogo</Link>
          {user ? (
            <>
              <Link to="/profile" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-cyan-400">Mi Perfil ({user.name})</Link>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="block text-sm text-rose-400">Cerrar Sesión</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-bold text-cyan-400">Iniciar Sesión / Registrarse</Link>
          )}
        </div>
      )}
    </nav>
  );
};

