import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-8 px-4 sm:px-6 lg:px-8 mt-12 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <div className="flex items-center space-x-2 mb-2">
            <img src="/logo.png" alt="Librería Rubén Darío" className="w-8 h-8 object-contain" />
            <h4 className="font-bold text-white text-base">Librería Rubén Darío</h4>
          </div>
          <p className="text-xs text-slate-400">
            Tu librería de confianza para insumos escolares, comerciales, papelería y productos artísticos. Precios minoristas y venta mayorista para negocios e instituciones.
          </p>
        </div>
        <div>
          <h4 className="font-bold text-white text-sm mb-2">Atención al Cliente</h4>
          <p className="text-xs text-slate-400">Lunes a Viernes de 8:30 a 19:30 hs</p>
          <p className="text-xs text-slate-400">Sábados de 9:00 a 13:30 hs</p>
          <p className="text-xs text-cyan-400 mt-1">contacto@libreriard.com.ar</p>
        </div>
        <div>
          <h4 className="font-bold text-white text-sm mb-2">Ventas Mayoristas</h4>
          <p className="text-xs text-slate-400">
            ¿Tienes un negocio, librería o institución? Regístrate y solicita tu alta mayorista desde tu perfil para acceder a nuestra lista de precios especial.
          </p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} Librería Rubén Darío. Todos los derechos reservados.
      </div>
    </footer>
  );
};
