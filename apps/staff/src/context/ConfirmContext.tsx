import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { AlertTriangle, AlertCircle, Info, CheckCircle, Key, X } from 'lucide-react';

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

export interface PromptOptions {
  title?: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'password' | 'email' | 'number';
  confirmText?: string;
  cancelText?: string;
  validate?: (value: string) => string | null;
}

export interface AlertOptions {
  title?: string;
  message: string;
  confirmText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

interface DialogState {
  type: 'confirm' | 'prompt' | 'alert';
  title: string;
  message: string;
  confirmText: string;
  cancelText?: string;
  variant: 'danger' | 'warning' | 'info' | 'success';
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'password' | 'email' | 'number';
  validate?: (value: string) => string | null;
}

interface ConfirmContextValue {
  confirm: (options: ConfirmOptions | string) => Promise<boolean>;
  prompt: (options: PromptOptions | string) => Promise<string | null>;
  alert: (options: AlertOptions | string) => Promise<void>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const resolveRef = useRef<((val: any) => void) | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dialog && dialog.type === 'prompt') {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [dialog]);

  const confirm = (options: ConfirmOptions | string): Promise<boolean> => {
    const opts = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setDialog({
        type: 'confirm',
        title: opts.title || '¿Confirmar acción?',
        message: opts.message,
        confirmText: opts.confirmText || 'Confirmar',
        cancelText: opts.cancelText || 'Cancelar',
        variant: opts.variant || 'warning'
      });
    });
  };

  const prompt = (options: PromptOptions | string): Promise<string | null> => {
    const opts = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setPromptValue(opts.defaultValue || '');
      setValidationError(null);
      setDialog({
        type: 'prompt',
        title: opts.title || 'Ingrese la información',
        message: opts.message,
        confirmText: opts.confirmText || 'Aceptar',
        cancelText: opts.cancelText || 'Cancelar',
        variant: 'info',
        placeholder: opts.placeholder || '',
        defaultValue: opts.defaultValue || '',
        inputType: opts.inputType || 'text',
        validate: opts.validate
      });
    });
  };

  const alert = (options: AlertOptions | string): Promise<void> => {
    const opts = typeof options === 'string' ? { message: options } : options;
    return new Promise((resolve) => {
      resolveRef.current = () => resolve();
      setDialog({
        type: 'alert',
        title: opts.title || 'Información',
        message: opts.message,
        confirmText: opts.confirmText || 'Entendido',
        variant: opts.variant || 'info'
      });
    });
  };

  const handleClose = (result: any) => {
    setDialog(null);
    setValidationError(null);
    if (resolveRef.current) {
      resolveRef.current(result);
      resolveRef.current = null;
    }
  };

  const handlePromptConfirm = () => {
    if (!dialog) return;
    if (dialog.validate) {
      const err = dialog.validate(promptValue);
      if (err) {
        setValidationError(err);
        return;
      }
    }
    handleClose(promptValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (dialog?.type === 'alert') handleClose(undefined);
      else if (dialog?.type === 'confirm') handleClose(false);
      else handleClose(null);
    } else if (e.key === 'Enter') {
      if (dialog?.type === 'prompt') {
        e.preventDefault();
        handlePromptConfirm();
      } else if (dialog?.type === 'confirm') {
        e.preventDefault();
        handleClose(true);
      } else if (dialog?.type === 'alert') {
        e.preventDefault();
        handleClose(undefined);
      }
    }
  };

  const renderIcon = () => {
    if (!dialog) return null;
    if (dialog.type === 'prompt') {
      return (
        <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
          <Key size={20} />
        </div>
      );
    }
    switch (dialog.variant) {
      case 'danger':
        return (
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center shrink-0">
            <AlertCircle size={20} />
          </div>
        );
      case 'warning':
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <AlertTriangle size={20} />
          </div>
        );
      case 'success':
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
            <CheckCircle size={20} />
          </div>
        );
      case 'info':
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
            <Info size={20} />
          </div>
        );
    }
  };

  const getConfirmButtonClasses = () => {
    if (!dialog) return '';
    switch (dialog.variant) {
      case 'danger':
        return 'bg-rose-500 hover:bg-rose-600 text-white';
      case 'warning':
        return 'bg-amber-400 hover:bg-amber-300 text-slate-950';
      case 'success':
        return 'bg-emerald-500 hover:bg-emerald-600 text-white';
      case 'info':
      default:
        return 'bg-cyan-400 hover:bg-cyan-300 text-slate-950';
    }
  };

  return (
    <ConfirmContext.Provider value={{ confirm, prompt, alert }}>
      {children}

      {dialog && (
        <div
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-5 sm:p-6 max-w-md w-full shadow-2xl space-y-4 my-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3.5">
              {renderIcon()}
              <div className="flex-1 min-w-0">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">{dialog.title}</h3>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 leading-relaxed whitespace-pre-line">
                  {dialog.message}
                </p>
              </div>
            </div>

            {/* Prompt input field */}
            {dialog.type === 'prompt' && (
              <div className="space-y-1.5 pt-1">
                <input
                  ref={inputRef}
                  type={dialog.inputType || 'text'}
                  value={promptValue}
                  onChange={(e) => {
                    setPromptValue(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder={dialog.placeholder}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition"
                />
                {validationError && (
                  <p className="text-[11px] text-rose-400 font-medium pl-1 flex items-center gap-1">
                    <AlertCircle size={12} />
                    <span>{validationError}</span>
                  </p>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              {dialog.type !== 'alert' && (
                <button
                  type="button"
                  onClick={() => handleClose(dialog.type === 'prompt' ? null : false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                >
                  {dialog.cancelText || 'Cancelar'}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  if (dialog.type === 'prompt') handlePromptConfirm();
                  else if (dialog.type === 'confirm') handleClose(true);
                  else handleClose(undefined);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${getConfirmButtonClasses()}`}
              >
                {dialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = (): ConfirmContextValue => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within a ConfirmProvider');
  return ctx;
};

