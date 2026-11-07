import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const getPageTitle = (path: string): string => {
    if (path === '/') return 'Panel General';
    if (path.startsWith('/products')) return 'Catálogo de Productos';
    if (path.startsWith('/orders/create')) return 'Crear Orden Manual';
    if (path.startsWith('/orders')) return 'Gestión de Órdenes';
    if (path.startsWith('/statistics')) return 'Estadísticas del Negocio';
    if (path.startsWith('/customers')) return 'Gestión de Clientes';
    if (path.startsWith('/staff')) return 'Personal Staff';
    if (path.startsWith('/settings')) return 'Configuración';
    if (path.startsWith('/audit-logs')) return 'Auditoría del Sistema';
    return 'Librería Rubén Darío';
  };

  return (
    <div className="flex h-[100dvh] w-full max-w-full bg-slate-900 text-slate-100 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-full max-h-[100dvh] overflow-hidden">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} title={getPageTitle(location.pathname)} />
        <main className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden p-3 sm:p-4 md:p-6 bg-slate-900 overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
