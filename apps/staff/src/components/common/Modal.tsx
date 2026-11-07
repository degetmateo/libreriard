import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, maxWidth = 'max-w-xl' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2.5 sm:p-4">
      <div className={`relative w-full ${maxWidth} max-h-[92dvh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-4 sm:p-6 text-slate-100 my-auto animate-in fade-in zoom-in-95 duration-150`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3 shrink-0">
          <h3 className="text-base sm:text-lg font-bold text-cyan-400 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
            aria-label="Cerrar modal"
          >
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 overscroll-contain pr-1">
          {children}
        </div>
      </div>
    </div>
  );
};
