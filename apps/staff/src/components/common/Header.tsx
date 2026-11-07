import React from 'react';
import { Menu, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Badge } from './Badge';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, title }) => {
  const { user, isAdmin } = useAuth();

  return (
    <header className="h-16 bg-slate-950/80 backdrop-blur border-b border-slate-800 px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-900"
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">{title}</h2>
      </div>

      <div className="flex items-center space-x-3">
        <div className="text-right hidden sm:block">
          <p className="text-sm font-medium text-slate-200">{user?.name}</p>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
        <Badge
          label={isAdmin ? 'ADMINISTRADOR' : 'EMPLEADO'}
          variant={isAdmin ? 'cyan' : 'slate'}
        />
        <div className="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
          <Shield size={16} />
        </div>
      </div>
    </header>
  );
};
