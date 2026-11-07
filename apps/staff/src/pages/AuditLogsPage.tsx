import React, { useEffect, useState } from 'react';
import { AuditLogDto, AuditLogTag } from '@libreriard/shared';
import { AuditLogService } from '../services/audit-log.service';
import { AuditDiffModal } from '../components/audit/AuditDiffModal';
import { Pagination } from '../components/common/Pagination';
import { Badge } from '../components/common/Badge';
import { Eye, ShieldAlert } from 'lucide-react';

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLogDto[]>([]);
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [selectedLog, setSelectedLog] = useState<AuditLogDto | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const auditService = new AuditLogService();

  const loadLogs = async () => {
    setLoading(true);
    const params: Record<string, string | number> = { page, limit: 20 };
    if (selectedTag) params.tag = selectedTag;
    const res = await auditService.getLogs(params);
    if (res.success && res.data) {
      setLogs(res.data);
      setTotalItems(res.total || res.data.length);
      setTotalPages(res.totalPages || Math.ceil((res.total || res.data.length) / 20) || 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, [selectedTag, page]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex items-center space-x-2">
          <ShieldAlert size={20} className="text-cyan-400" />
          <h3 className="text-sm font-semibold text-slate-300">Registro Histórico de Auditoría</h3>
        </div>
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => { setSelectedTag(''); setPage(1); }}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              !selectedTag ? 'bg-cyan-400 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            Todos
          </button>
          {Object.values(AuditLogTag).map((t) => (
            <button
              key={t}
              onClick={() => { setSelectedTag(t); setPage(1); }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedTag === t ? 'bg-cyan-400 text-slate-950' : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 text-[10px] uppercase border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3">Fecha y Hora</th>
                <th className="p-3">Acción</th>
                <th className="p-3">Actor</th>
                <th className="p-3">Entidad</th>
                <th className="p-3">Etiquetas</th>
                <th className="p-3 text-right">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    Cargando registros...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No hay registros de auditoría.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3 font-mono text-xs text-slate-400">
                      {new Date(l.timestamp).toLocaleString('es-AR')}
                    </td>
                    <td className="p-3 font-semibold text-white">{l.action}</td>
                    <td className="p-3 text-xs">
                      <span className="text-slate-200 font-medium">{l.actor.name}</span>
                      <span className="text-slate-500 block">({l.actor.role})</span>
                    </td>
                    <td className="p-3 text-xs font-mono text-cyan-400">{l.entity.type}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {l.tags.map((t) => (
                          <Badge key={t} label={t} variant="slate" />
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setSelectedLog(l)}
                        className="text-slate-400 hover:text-cyan-400 p-1.5 hover:bg-slate-900 rounded-lg transition"
                      >
                        <Eye size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-3 pb-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={20}
            onPageChange={setPage}
          />
        </div>
      </div>

      <AuditDiffModal
        log={selectedLog}
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  );
};
