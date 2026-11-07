import React, { useEffect, useState } from 'react';
import { Modal } from '../common/Modal';
import { PriceHistoryDto, ProductDto } from '@libreriard/shared';
import { ProductService } from '../../services/product.service';
import { History, TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import { Pagination } from '../common/Pagination';

interface Props {
  product?: ProductDto | null;
  isOpen: boolean;
  onClose: () => void;
}

const SOURCE_LABELS: Record<string, string> = {
  MANUAL_EDIT: 'Edición en Catálogo',
  MANUAL_ORDER: 'Orden Manual',
  EXCEL_IMPORT: 'Importación Excel',
  MASSIVE_IMPORT: 'Carga Masiva'
};

export const PriceHistoryModal: React.FC<Props> = ({ product, isOpen, onClose }) => {
  const [history, setHistory] = useState<PriceHistoryDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const productService = new ProductService();

  const loadHistory = async (p = 1) => {
    setLoading(true);
    try {
      const res = product
        ? await productService.getProductPriceHistory(product.id, p, 10)
        : await productService.getAllPriceHistory(p, 10);

      if (res.success && res.data) {
        setHistory(res.data);
        if (res.total !== undefined) setTotalItems(res.total);
        if (res.totalPages !== undefined) setTotalPages(res.totalPages);
        setPage(p);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory(1);
    }
  }, [isOpen, product]);

  if (!isOpen) return null;

  const title = product
    ? `Historial de Precios: ${product.name}`
    : 'Historial Global de Modificaciones de Precios';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-4xl">
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-slate-400 text-xs">Cargando registros históricos...</div>
        ) : history.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No se registran cambios de precios para este producto aún.
          </div>
        ) : (
          <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-left uppercase text-[10px] font-bold">
                    <th className="py-2.5 px-3">Fecha y Hora</th>
                    {!product && <th className="py-2.5 px-3">Producto</th>}
                    <th className="py-2.5 px-3">Tipo</th>
                    <th className="py-2.5 px-3">Precio Anterior &rarr; Nuevo</th>
                    <th className="py-2.5 px-3 text-right">Diferencia ($)</th>
                    <th className="py-2.5 px-3 text-right">Variación (%)</th>
                    <th className="py-2.5 px-3">Origen</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {history.map((item) => {
                    const isIncrease = item.diffAmount > 0;
                    const isDecrease = item.diffAmount < 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-900/40 transition">
                        <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap font-mono text-[11px]">
                          {new Date(item.createdAt).toLocaleString('es-AR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        {!product && (
                          <td className="py-2.5 px-3 font-medium text-white max-w-[200px] truncate">
                            {item.productName}
                          </td>
                        )}
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              item.priceType === 'WHOLESALE'
                                ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {item.priceType === 'WHOLESALE' ? 'MAYORISTA' : 'MINORISTA'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-300 whitespace-nowrap">
                          <span className="text-slate-400">
                            {item.oldPrice !== null ? `$${item.oldPrice.toLocaleString('es-AR')}` : 'S/P'}
                          </span>
                          <ArrowRight size={12} className="inline mx-1.5 text-slate-500" />
                          <span className="font-bold text-white">
                            {item.newPrice !== null ? `$${item.newPrice.toLocaleString('es-AR')}` : 'S/P'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                          {isIncrease ? (
                            <span className="text-emerald-400">
                              +${item.diffAmount.toLocaleString('es-AR')}
                            </span>
                          ) : isDecrease ? (
                            <span className="text-rose-400">
                              -${Math.abs(item.diffAmount).toLocaleString('es-AR')}
                            </span>
                          ) : (
                            <span className="text-slate-500">$0</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap">
                          {isIncrease ? (
                            <span className="inline-flex items-center gap-0.5 text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded text-[10px]">
                              <TrendingUp size={11} /> +{item.diffPercentage}%
                            </span>
                          ) : isDecrease ? (
                            <span className="inline-flex items-center gap-0.5 text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded text-[10px]">
                              <TrendingDown size={11} /> {item.diffPercentage}%
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
                              <Minus size={11} /> 0%
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                          <span className="block">{SOURCE_LABELS[item.source] || item.source}</span>
                          {item.changedBy && (
                            <span className="text-[10px] text-slate-500 block truncate max-w-[140px]">
                              {item.changedBy.name || item.changedBy.email}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={10}
              onPageChange={loadHistory}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

