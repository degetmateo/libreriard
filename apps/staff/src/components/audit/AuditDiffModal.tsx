import React from 'react';
import { Modal } from '../common/Modal';
import { AuditLogDto } from '@libreriard/shared';
import { Badge } from '../common/Badge';

interface AuditDiffModalProps {
  log: AuditLogDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditDiffModal: React.FC<AuditDiffModalProps> = ({ log, isOpen, onClose }) => {
  if (!log) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Auditoría: ${log.action}`} maxWidth="max-w-3xl">
      <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1 text-xs">
        <div className="bg-slate-800/60 p-3 rounded-lg grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div><span className="text-slate-400">Actor:</span> <p className="font-semibold text-white">{log.actor.name} ({log.actor.role})</p></div>
          <div><span className="text-slate-400">Entidad:</span> <p className="font-semibold text-white">{log.entity.type} ({log.entity.id.slice(0, 8)}...)</p></div>
          <div><span className="text-slate-400">Fecha:</span> <p className="font-semibold text-white">{new Date(log.timestamp).toLocaleString('es-AR')}</p></div>
          <div><span className="text-slate-400">Etiquetas:</span> <div className="flex gap-1 mt-0.5">{log.tags.map(t => <Badge key={t} label={t} variant="cyan" />)}</div></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <h4 className="font-bold text-rose-400 uppercase tracking-wider mb-2">Estado Previo (Before)</h4>
            <pre className="font-mono bg-slate-900 p-2 rounded overflow-x-auto text-[11px] text-slate-300">
              {log.changes.before ? JSON.stringify(log.changes.before, null, 2) : 'null'}
            </pre>
          </div>
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
            <h4 className="font-bold text-emerald-400 uppercase tracking-wider mb-2">Estado Posterior (After)</h4>
            <pre className="font-mono bg-slate-900 p-2 rounded overflow-x-auto text-[11px] text-slate-300">
              {log.changes.after ? JSON.stringify(log.changes.after, null, 2) : 'null'}
            </pre>
          </div>
        </div>
      </div>
    </Modal>
  );
};

