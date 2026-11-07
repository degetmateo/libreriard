import React, { useState } from 'react';
import { RetailPriceTier } from '@libreriard/shared';
import { Plus, Trash2, Tag } from 'lucide-react';

interface Props {
  tiers: RetailPriceTier[];
  onChange: (tiers: RetailPriceTier[]) => void;
}

export const RetailPriceTiersEditor: React.FC<Props> = ({ tiers, onChange }) => {
  const [minQty, setMinQty] = useState('');
  const [price, setPrice] = useState('');

  const handleAddTier = (e: React.MouseEvent) => {
    e.preventDefault();
    const q = parseInt(minQty, 10);
    const p = parseFloat(price);
    if (!q || q < 2 || !p || p <= 0) return;
    const exists = tiers.some((t) => t.minQuantity === q);
    if (exists) {
      onChange(tiers.map((t) => (t.minQuantity === q ? { minQuantity: q, unitPrice: p } : t)));
    } else {
      const updated = [...tiers, { minQuantity: q, unitPrice: p }].sort((a, b) => a.minQuantity - b.minQuantity);
      onChange(updated);
    }
    setMinQty('');
    setPrice('');
  };

  const handleRemove = (qty: number) => {
    onChange(tiers.filter((t) => t.minQuantity !== qty));
  };

  return (
    <div className="bg-slate-900/70 border border-slate-800 rounded-lg p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <label className="text-xs text-slate-300 font-semibold flex items-center gap-1.5">
          <Tag size={13} className="text-cyan-400" />
          <span>Precios Minoristas por Cantidad / Escalas (Opcional)</span>
        </label>
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1">
          <input
            type="number"
            min="2"
            placeholder="Mín. unidades (ej: 10)"
            value={minQty}
            onChange={(e) => setMinQty(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
          />
        </div>
        <div className="flex-1">
          <input
            type="number"
            step="0.01"
            min="0.01"
            placeholder="Precio Unitario $ (ej: 180)"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-1.5 text-xs text-white"
          />
        </div>
        <button
          type="button"
          onClick={handleAddTier}
          className="px-2.5 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
        >
          <Plus size={13} />
          <span>Agregar Escala</span>
        </button>
      </div>

      {tiers.length > 0 && (
        <div className="space-y-1.5 pt-1">
          {tiers.map((t) => (
            <div key={t.minQuantity} className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1 rounded text-xs border border-slate-700/60">
              <span className="text-slate-300">
                A partir de <strong className="text-cyan-300">{t.minQuantity}</strong> unidades: <strong className="text-emerald-400">${t.unitPrice.toLocaleString('es-AR')}</strong> c/u
              </span>
              <button
                type="button"
                onClick={() => handleRemove(t.minQuantity)}
                className="text-slate-400 hover:text-rose-400 p-1 transition"
                title="Eliminar escala"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

