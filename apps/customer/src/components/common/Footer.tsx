import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CatalogService } from '../../services/catalog.service';
import { FooterContactDto } from '@libreriard/shared';
import { MapPin, Phone, Mail, Clock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  const [contact, setContact] = useState<FooterContactDto>({
    address: 'Av. Principal 1234, San Rafael, Mendoza',
    googleMapsUrl: 'https://maps.google.com',
    schedule: 'Lunes a Viernes 8:30 a 12:30 y 16:30 a 20:30',
    email: 'contacto@libreriard.com.ar',
    phone: '+54 9 260 4123456'
  });

  useEffect(() => {
    new CatalogService().getSettings().then((res) => {
      if (res.success && res.data?.footerContact) {
        setContact(res.data.footerContact);
      }
    });
  }, []);

  return (
    <footer className="bg-slate-900 border-t border-slate-800 text-slate-400 py-10 px-4 sm:px-6 lg:px-8 mt-14 text-xs">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <img src="/logo.png" alt="Librería Rubén Darío" className="w-8 h-8 object-contain" />
            <h4 className="font-black text-white text-base">Librería Rubén Darío</h4>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Insumos escolares, comerciales, artísticos y papelería general con la mejor atención minorista y mayorista.
          </p>
          <div className="mt-4 flex flex-col gap-1.5 font-medium text-slate-400">
            <Link to="/terms-and-conditions" className="hover:text-cyan-400 transition">Términos y Condiciones</Link>
            <Link to="/privacy-policy" className="hover:text-cyan-400 transition">Política de Privacidad</Link>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Ubicación y Local</h4>
          <p className="flex items-start gap-2 text-slate-300 mb-2">
            <MapPin size={16} className="text-cyan-400 shrink-0 mt-0.5" />
            <span>{contact.address}</span>
          </p>
          {contact.googleMapsUrl && (
            <a
              href={contact.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-semibold"
            >
              <span>Ver en Google Maps</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Contacto y Horarios</h4>
          <div className="space-y-2 text-slate-300">
            <p className="flex items-start gap-2">
              <Clock size={16} className="text-cyan-400 shrink-0 mt-0.5" />
              <span>{contact.schedule}</span>
            </p>
            <p className="flex items-center gap-2">
              <Phone size={16} className="text-cyan-400 shrink-0" />
              <span>{contact.phone}</span>
            </p>
            <p className="flex items-center gap-2">
              <Mail size={16} className="text-cyan-400 shrink-0" />
              <span className="text-cyan-300">{contact.email}</span>
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-white text-sm mb-3">Ventas Mayoristas</h4>
          <p className="text-slate-400 leading-relaxed mb-3">
            Atendemos comercios, instituciones y revendedores con precios diferenciados.
          </p>
          <Link
            to="/register"
            className="inline-block px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-bold rounded-xl border border-slate-700 text-xs transition"
          >
            Registrarse y Solicitar
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-slate-800 text-center text-slate-500">
        © {new Date().getFullYear()} Librería Rubén Darío. Todos los derechos reservados.
      </div>
    </footer>
  );
};
