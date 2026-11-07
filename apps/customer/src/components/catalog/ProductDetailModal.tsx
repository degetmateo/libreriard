import React, { useState } from 'react';
import { ProductDto, ProductVariantDto, RetailPriceTier } from '@libreriard/shared';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { ImageCarousel } from './ImageCarousel';
import { X, ShoppingCart, Check, AlertCircle, Tag } from 'lucide-react';

interface Props {
  product: ProductDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<Props> = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;
  const { addItem } = useCart();
  const { isWholesale } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | undefined>(product.subTypes?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const rawBase = isWholesale ? product.wholesalePrice : product.retailPrice;
  const hasPrice = typeof rawBase === 'number';
  const basePrice = hasPrice ? rawBase : 0;
  const modifier = selectedVariant?.priceModifier || 0;

  let currentUnitPrice = basePrice;
  let discountApplied = false;
  if (!isWholesale && product.retailPriceTiers && product.retailPriceTiers.length > 0) {
    const match = [...product.retailPriceTiers]
      .filter((t) => t.minQuantity <= quantity)
      .sort((a, b) => b.minQuantity - a.minQuantity);
    if (match.length > 0 && match[0].unitPrice < basePrice) {
      currentUnitPrice = match[0].unitPrice;
      discountApplied = true;
    }
  }
  const finalPrice = currentUnitPrice + modifier;

  const handleAdd = () => {
    if (!hasPrice) return;
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 relative shadow-2xl overflow-y-auto max-h-[92dvh] my-auto">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 z-10">
          <X size={20} />
        </button>

        <ImageCarousel images={product.images || []} altName={product.name} />

        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">{product.supplier || 'Rubén Darío'}</span>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">{product.name}</h3>
            {product.barcode && <p className="text-xs text-slate-400 mt-0.5 font-mono">Código: {product.barcode}</p>}
          </div>

          <div className="flex items-baseline space-x-2">
            {hasPrice ? (
              <>
                <span className="text-2xl font-black text-slate-900">${finalPrice.toLocaleString('es-AR')}</span>
                {discountApplied && (
                  <span className="text-xs text-slate-400 line-through">
                    ${(basePrice + modifier).toLocaleString('es-AR')}
                  </span>
                )}
                {isWholesale && <span className="text-xs font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full">Precio Mayorista</span>}
              </>
            ) : (
              <span className="text-sm font-bold text-amber-600 flex items-center gap-1">
                <AlertCircle size={15} /> Consultar precio (No disponible para compra {isWholesale ? 'mayorista' : 'minorista'})
              </span>
            )}
          </div>

          {!isWholesale && product.retailPriceTiers && product.retailPriceTiers.length > 0 && (
            <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-3 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Tag size={13} /> <span>Descuentos minoristas por cantidad:</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-700">
                {product.retailPriceTiers.map((t: RetailPriceTier) => (
                  <div key={t.minQuantity} className={`px-2.5 py-1 rounded-lg border flex justify-between ${quantity >= t.minQuantity ? 'bg-emerald-200/60 border-emerald-300 font-bold text-emerald-950' : 'bg-white/80 border-emerald-100'}`}>
                    <span>{t.minQuantity}+ u.:</span>
                    <span>${t.unitPrice.toLocaleString('es-AR')} c/u</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {product.description && <p className="text-xs text-slate-600 leading-relaxed">{product.description}</p>}

          {product.subTypes && product.subTypes.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Elige una variante / modelo:</label>
              <div className="grid grid-cols-2 gap-2">
                {product.subTypes.map((v: ProductVariantDto) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-2 rounded-xl border text-xs text-left transition ${
                      selectedVariant?.id === v.id ? 'border-cyan-500 bg-cyan-50 font-bold text-cyan-800' : 'border-slate-200 text-slate-700'
                    }`}
                  >
                    <span>{v.name}</span>
                    {v.priceModifier !== 0 && (
                      <span className="block text-[10px] text-slate-500">
                        {v.priceModifier > 0 ? `+$${v.priceModifier}` : `-$${Math.abs(v.priceModifier)}`}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
              <button disabled={!hasPrice} onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold disabled:opacity-50">-</button>
              <span className="px-4 py-2 text-sm font-bold text-slate-800">{quantity}</span>
              <button disabled={!hasPrice} onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold disabled:opacity-50">+</button>
            </div>
            <button
              onClick={handleAdd}
              disabled={!hasPrice}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition disabled:opacity-40 disabled:cursor-not-allowed ${
                added ? 'bg-emerald-500 text-white' : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'
              }`}
            >
              {added ? <><Check size={18} /><span>¡Agregado al carrito!</span></> : <><ShoppingCart size={18} /><span>{hasPrice ? 'Agregar al Carrito' : 'Sin Precio Disponible'}</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
