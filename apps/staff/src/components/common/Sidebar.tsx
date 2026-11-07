import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, UserCheck, Sliders, ShieldAlert, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin, logout } = useAuth();

  const links = [
    { to: '/', label: 'Panel Principal', icon: LayoutDashboard },
    { to: '/products', label: 'Productos', icon: Package },
    { to: '/orders', label: 'Órdenes', icon: ShoppingCart },
    { to: '/customers', label: 'Clientes', icon: Users },
    ...(isAdmin ? [
      { to: '/staff', label: 'Gestión de Staff', icon: UserCheck },
      { to: '/settings', label: 'Configuración', icon: Sliders },
      { to: '/audit-logs', label: 'Logs de Auditoría', icon: ShieldAlert }
    ] : [])
  ];

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={onClose} />
      )}
      <aside className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
            <img src="/logo.png" alt="Rubén Darío Logo" className="w-10 h-10 object-contain drop-shadow" />
            <div>
              <h1 className="font-bold text-sm tracking-wide text-white">Librería Rubén Darío</h1>
              <span className="text-xs text-cyan-400 font-medium">Panel de Staff</span>
            </div>
          </div>
          <nav className="p-3 space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-sm font-medium text-rose-400 hover:bg-rose-950/30 border border-rose-900/30 transition"
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
