import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ProductDto, OrderType, RetailPriceTier } from '@libreriard/shared';
import { ProductService } from '../../services/product.service';
import { useConfirm } from '../../context/ConfirmContext';
import { Trash2, Plus, Barcode, CheckSquare, Square, Tag } from 'lucide-react';

export interface ManualItemRow {
  id: string;
  productId?: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  originalUnitPrice: number;
  discountApplied: boolean;
  addToDb: boolean;
  updatePriceInDb: boolean;
  isCustom: boolean;
  retailPriceTiers?: RetailPriceTier[];
}

interface Props {
  rows: ManualItemRow[];
  orderType: OrderType;
  onChange: (rows: ManualItemRow[]) => void;
}

export const ManualOrderTable: React.FC<Props> = ({ rows, orderType, onChange }) => {
  const [catalog, setCatalog] = useState<ProductDto[]>([]);
  const [activeDropdownRowId, setActiveDropdownRowId] = useState<string | null>(null);
  const [dropdownCoords, setDropdownCoords] = useState<{ top: number; left: number; width: number } | null>(null);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);
  const [barcodeInput, setBarcodeInput] = useState('');
  const barcodeRef = useRef<HTMLInputElement>(null);
  const nameInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const dropdownItemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const productService = new ProductService();

  const { alert } = useConfirm();

  const updateDropdownPosition = (rowId: string) => {
    const inputEl = nameInputRefs.current[rowId];
    if (inputEl) {
      const rect = inputEl.getBoundingClientRect();
      const popupWidth = Math.min(window.innerWidth - 16, Math.max(260, rect.width));
      let left = rect.left;
      if (left + popupWidth > window.innerWidth - 8) {
        left = window.innerWidth - popupWidth - 8;
      }
      left = Math.max(8, left);
      setDropdownCoords({
        top: rect.bottom + 4,
        left,
        width: popupWidth
      });
    }
  };

  useEffect(() => {
    productService.getProducts({ limit: 1000 }).then((res) => {
      if (res.success && res.data) setCatalog(res.data);
    });
  }, []);

  useEffect(() => {
    if (!activeDropdownRowId) {
      setDropdownCoords(null);
      return;
    }
    updateDropdownPosition(activeDropdownRowId);

    const handleScrollOrResize = () => {
      updateDropdownPosition(activeDropdownRowId);
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);
    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [activeDropdownRowId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        !target.closest('[data-dropdown-popup="true"]') &&
        !Object.values(nameInputRefs.current).some((el) => el && el.contains(target))
      ) {
        setActiveDropdownRowId(null);
        setHighlightedIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const createEmptyRow = (): ManualItemRow => ({
    id: `row-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    productName: '',
    quantity: 1,
    unitPrice: 0,
    originalUnitPrice: 0,
    discountApplied: false,
    addToDb: false,
    updatePriceInDb: false,
    isCustom: true
  });

  const handleAddRow = () => {
    const newRow = createEmptyRow();
    const updated = [...rows, newRow];
    onChange(updated);
    setTimeout(() => {
      nameInputRefs.current[newRow.id]?.focus();
    }, 50);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length === 1) {
      onChange([createEmptyRow()]);
      return;
    }
    onChange(rows.filter((r) => r.id !== id));
  };

  const calculateRowPrice = (
    basePrice: number,
    qty: number,
    tiers?: RetailPriceTier[]
  ): { price: number; discount: boolean } => {
    if (orderType === OrderType.RETAIL && tiers && tiers.length > 0) {
      const match = [...tiers].filter((t) => t.minQuantity <= qty).sort((a, b) => b.minQuantity - a.minQuantity);
      if (match.length > 0 && match[0].unitPrice < basePrice) {
        return { price: match[0].unitPrice, discount: true };
      }
    }
    return { price: basePrice, discount: false };
  };

  const handleSelectProduct = (rowId: string, product: ProductDto) => {
    const base = orderType === OrderType.WHOLESALE ? product.wholesalePrice || 0 : product.retailPrice || 0;
    const currentQty = rows.find((r) => r.id === rowId)?.quantity || 1;
    const { price, discount } = calculateRowPrice(base, currentQty, product.retailPriceTiers);

    const updated = rows.map((r) => {
      if (r.id === rowId) {
        return {
          ...r,
          productId: product.id,
          productName: product.name,
          unitPrice: price,
          originalUnitPrice: base,
          discountApplied: discount,
          addToDb: false,
          updatePriceInDb: false,
          isCustom: false,
          retailPriceTiers: product.retailPriceTiers
        };
      }
      return r;
    });

    onChange(updated);
    setActiveDropdownRowId(null);
    setHighlightedIndex(-1);
  };

  const handleNameChange = (rowId: string, value: string) => {
    setActiveDropdownRowId(rowId);
    setHighlightedIndex(0);
    updateDropdownPosition(rowId);
    const updated = rows.map((r) => {
      if (r.id === rowId) {
        return { ...r, productName: value, isCustom: true, productId: undefined };
      }
      return r;
    });
    onChange(updated);
  };

  const handleQuantityChange = (rowId: string, qtyNum: number) => {
    const qty = Math.max(1, qtyNum);
    const updated = rows.map((r) => {
      if (r.id === rowId) {
        let price = r.unitPrice;
        let discount = r.discountApplied;
        if (!r.isCustom && r.retailPriceTiers && orderType === OrderType.RETAIL) {
          const calc = calculateRowPrice(r.originalUnitPrice, qty, r.retailPriceTiers);
          price = calc.price;
          discount = calc.discount;
        }
        return { ...r, quantity: qty, unitPrice: price, discountApplied: discount };
      }
      return r;
    });
    onChange(updated);
  };

  const handlePriceChange = (rowId: string, priceNum: number) => {
    const price = Math.max(0, priceNum);
    const updated = rows.map((r) => {
      if (r.id === rowId) {
        const changed = !r.isCustom && price !== r.originalUnitPrice;
        return {
          ...r,
          unitPrice: price,
          updatePriceInDb: changed ? r.updatePriceInDb : false
        };
      }
      return r;
    });
    onChange(updated);
  };

  const handleToggleCheck = (rowId: string, field: 'addToDb' | 'updatePriceInDb') => {
    const updated = rows.map((r) => (r.id === rowId ? { ...r, [field]: !r[field] } : r));
    onChange(updated);
  };

  // Keyboard navigation: Arrows navigate dropdown, Enter selects or creates new row, Escape closes
  const handleKeyDown = (e: React.KeyboardEvent, rowId: string, fieldIndex: number) => {
    const row = rows.find((r) => r.id === rowId);
    const matches = row && row.productName.trim()
      ? catalog.filter((p) => p.name.toLowerCase().includes(row.productName.toLowerCase())).slice(0, 8)
      : [];
    const isDropdownOpen = activeDropdownRowId === rowId && matches.length > 0;

    if (fieldIndex === 0) {
      if (e.key === 'ArrowDown') {
        if (!isDropdownOpen) {
          setActiveDropdownRowId(rowId);
          setHighlightedIndex(0);
          return;
        }
        e.preventDefault();
        const next = highlightedIndex < matches.length - 1 ? highlightedIndex + 1 : 0;
        setHighlightedIndex(next);
        dropdownItemRefs.current[next]?.scrollIntoView({ block: 'nearest' });
        return;
      }

      if (e.key === 'ArrowUp') {
        if (isDropdownOpen) {
          e.preventDefault();
          const prev = highlightedIndex > 0 ? highlightedIndex - 1 : matches.length - 1;
          setHighlightedIndex(prev);
          dropdownItemRefs.current[prev]?.scrollIntoView({ block: 'nearest' });
          return;
        }
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveDropdownRowId(null);
        setHighlightedIndex(-1);
        return;
      }

      if (e.key === 'Enter') {
        if (isDropdownOpen && highlightedIndex >= 0 && matches[highlightedIndex]) {
          e.preventDefault();
          handleSelectProduct(rowId, matches[highlightedIndex]);
          return;
        }
        e.preventDefault();
        handleAddRow();
        return;
      }
    } else {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddRow();
      }
    }
  };

  // Barcode scanner handler
  const handleBarcodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = barcodeInput.trim();
    if (!code) return;

    const matched = catalog.find((p) => p.barcode === code);
    if (matched) {
      const existingIdx = rows.findIndex((r) => r.productId === matched.id);
      if (existingIdx > -1) {
        handleQuantityChange(rows[existingIdx].id, rows[existingIdx].quantity + 1);
      } else {
        const lastRow = rows[rows.length - 1];
        if (lastRow && !lastRow.productName && !lastRow.productId) {
          handleSelectProduct(lastRow.id, matched);
        } else {
          const newRow = createEmptyRow();
          const base = orderType === OrderType.WHOLESALE ? matched.wholesalePrice || 0 : matched.retailPrice || 0;
          const { price, discount } = calculateRowPrice(base, 1, matched.retailPriceTiers);
          onChange([
            ...rows,
            {
              ...newRow,
              productId: matched.id,
              productName: matched.name,
              unitPrice: price,
              originalUnitPrice: base,
              discountApplied: discount,
              isCustom: false,
              retailPriceTiers: matched.retailPriceTiers
            }
          ]);
        }
      }
    } else {
      await alert({
        title: 'Código no encontrado',
        message: `No se encontró ningún producto con el código de barras "${code}".\nPuede agregarlo manualmente en una fila de la tabla.`,
        variant: 'warning',
      });
    }
    setBarcodeInput('');
    barcodeRef.current?.focus();
  };

  const activeRow = rows.find((r) => r.id === activeDropdownRowId);
  const activeMatches = activeRow && activeRow.productName.trim()
    ? catalog.filter((p) => p.name.toLowerCase().includes(activeRow.productName.toLowerCase())).slice(0, 8)
    : [];

  return (
    <div className="space-y-3">
      {/* Barcode scanner quick input */}
      <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2 bg-slate-900 border border-slate-800 p-2.5 rounded-xl">
        <Barcode size={18} className="text-cyan-400" />
        <input
          ref={barcodeRef}
          value={barcodeInput}
          onChange={(e) => setBarcodeInput(e.target.value)}
          placeholder="Lector de código de barras (escanear y pulsar Enter)..."
          className="flex-1 bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
        />
        <span className="text-[10px] text-slate-500 hidden sm:inline">Escaneo automático activo</span>
      </form>

      {/* Excel-like Table */}
      <div className="border border-slate-800 rounded-xl overflow-visible bg-slate-950">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-900/80 text-slate-400 border-b border-slate-800 text-left uppercase text-[10px] font-bold">
                <th className="py-2.5 px-3 min-w-[260px]">Nombre del Producto</th>
                <th className="py-2.5 px-3 w-24 text-center">Cantidad</th>
                <th className="py-2.5 px-3 w-36 text-right">P. Unitario ($)</th>
                <th className="py-2.5 px-3 w-32 text-right">Subtotal ($)</th>
                <th className="py-2.5 px-3 w-48 text-center">Opciones BD</th>
                <th className="py-2.5 px-2 w-10 text-center"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rows.map((row, idx) => {
                const subtotal = Math.round(row.unitPrice * row.quantity * 100) / 100;

                return (
                  <tr key={row.id} className="hover:bg-slate-900/40 transition group">
                    {/* Product Name with inline autocomplete */}
                    <td className="p-2 relative">
                      <input
                        ref={(el) => { nameInputRefs.current[row.id] = el; }}
                        value={row.productName}
                        onChange={(e) => handleNameChange(row.id, e.target.value)}
                        onFocus={() => {
                          setActiveDropdownRowId(row.id);
                          setHighlightedIndex(0);
                          updateDropdownPosition(row.id);
                        }}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 0)}
                        placeholder="Escriba el nombre del artículo..."
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </td>

                    {/* Quantity */}
                    <td className="p-2">
                      <input
                        type="number"
                        min="1"
                        value={row.quantity}
                        onChange={(e) => handleQuantityChange(row.id, parseInt(e.target.value, 10) || 1)}
                        onKeyDown={(e) => handleKeyDown(e, row.id, 1)}
                        className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white text-center focus:border-cyan-400 focus:outline-none font-mono"
                      />
                    </td>

                    {/* Unit Price */}
                    <td className="p-2">
                      <div className="relative">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={row.unitPrice}
                          onChange={(e) => handlePriceChange(row.id, parseFloat(e.target.value) || 0)}
                          onKeyDown={(e) => handleKeyDown(e, row.id, 2)}
                          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg p-2 text-xs text-white text-right focus:border-cyan-400 focus:outline-none font-mono"
                        />
                        {row.discountApplied && (
                          <span className="absolute -top-2 right-1 text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded flex items-center gap-0.5 border border-emerald-500/40">
                            <Tag size={8} /> Desc.
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Subtotal */}
                    <td className="p-2 text-right font-mono font-bold text-white text-xs">
                      ${subtotal.toLocaleString('es-AR')}
                    </td>

                    {/* Options / DB flags */}
                    <td className="p-2">
                      {row.isCustom ? (
                        <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-300 hover:text-white">
                          <input
                            type="checkbox"
                            checked={row.addToDb}
                            onChange={() => handleToggleCheck(row.id, 'addToDb')}
                            className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                          />
                          <span>Guardar nuevo en BD</span>
                        </label>
                      ) : (
                        row.unitPrice !== row.originalUnitPrice && (
                          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-amber-400 hover:text-amber-300">
                            <input
                              type="checkbox"
                              checked={row.updatePriceInDb}
                              onChange={() => handleToggleCheck(row.id, 'updatePriceInDb')}
                              className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                            />
                            <span>Actualizar precio en BD</span>
                          </label>
                        )
                      )}
                    </td>

                    {/* Delete */}
                    <td className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(row.id)}
                        className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                        title="Eliminar fila"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="p-2.5 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleAddRow}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 font-semibold rounded-lg flex items-center gap-1.5 transition"
          >
            <Plus size={14} />
            <span>Agregar Fila (o pulsar Enter)</span>
          </button>

          <span className="text-[11px] text-slate-500">
            Tip: Presiona <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-300">Tab</kbd> para avanzar y <kbd className="px-1 py-0.5 bg-slate-800 rounded font-mono text-slate-300">Enter</kbd> para nueva fila
          </span>
        </div>
      </div>

      {/* Floating portal dropdown - Never clipped by table or scroll containers */}
      {activeDropdownRowId && dropdownCoords && activeMatches.length > 0 && typeof document !== 'undefined' &&
        createPortal(
          <div
            data-dropdown-popup="true"
            style={{
              position: 'fixed',
              top: `${dropdownCoords.top}px`,
              left: `${dropdownCoords.left}px`,
              width: `${dropdownCoords.width}px`,
              zIndex: 99999
            }}
            className="max-h-60 overflow-y-auto bg-slate-900 border border-slate-700 rounded-xl shadow-2xl divide-y divide-slate-800 animate-in fade-in duration-100"
          >
            {activeMatches.map((prod, mIdx) => {
              const pPrice = orderType === OrderType.WHOLESALE ? prod.wholesalePrice || 0 : prod.retailPrice || 0;
              const isHighlighted = highlightedIndex === mIdx;
              return (
                <button
                  key={prod.id}
                  ref={(el) => { dropdownItemRefs.current[mIdx] = el; }}
                  type="button"
                  onMouseEnter={() => setHighlightedIndex(mIdx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSelectProduct(activeDropdownRowId, prod);
                  }}
                  className={`w-full p-2.5 text-left text-xs flex items-center justify-between transition group ${
                    isHighlighted ? 'bg-cyan-500/20 text-cyan-300' : 'hover:bg-cyan-500/10 text-white'
                  }`}
                >
                  <div>
                    <span className={`font-semibold block ${isHighlighted ? 'text-cyan-300' : 'text-white group-hover:text-cyan-400'}`}>
                      {prod.name}
                    </span>
                    {prod.barcode && (
                      <span className="text-[10px] text-slate-500 font-mono">
                        Código: {prod.barcode}
                      </span>
                    )}
                  </div>
                  <span className="font-mono font-bold text-cyan-400 text-xs">
                    ${pPrice.toLocaleString('es-AR')}
                  </span>
                </button>
              );
            })}
          </div>,
          document.body
        )}
    </div>
  );
};
