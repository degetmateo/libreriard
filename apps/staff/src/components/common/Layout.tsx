import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path: string): string => {
    if (path === '/') return 'Panel General';
    if (path.startsWith('/productos')) return 'Catálogo de Productos';
    if (path.startsWith('/ordenes')) return 'Gestión de Órdenes';
    if (path.startsWith('/clientes')) return 'Gestión de Clientes';
    if (path.startsWith('/personal')) return 'Gestión de Personal Staff';
    if (path.startsWith('/ajustes-banco')) return 'Ajustes de Transferencia';
    if (path.startsWith('/logs')) return 'Auditoría y Logs del Sistema';
    return 'Librería Rubén Darío';
  };

  return (
    <div className="flex h-screen bg-slate-900 text-slate-100 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={getPageTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
