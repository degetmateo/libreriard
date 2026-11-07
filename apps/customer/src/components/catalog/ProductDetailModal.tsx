import React, { useState } from 'react';
import { ProductDto, ProductVariantDto } from '@libreriard/shared';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { X, ShoppingCart, Check } from 'lucide-react';

interface ProductDetailModalProps {
  product: ProductDto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, isOpen, onClose }) => {
  if (!isOpen || !product) return null;
  const { addItem } = useCart();
  const { isWholesale } = useAuth();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantDto | undefined>(product.subTypes?.[0]);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const basePrice = isWholesale ? product.wholesalePrice : product.retailPrice;
  const modifier = selectedVariant?.priceModifier || 0;
  const finalUnitPrice = basePrice + modifier;

  const handleAdd = () => {
    addItem(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => { setAdded(false); onClose(); }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 relative shadow-2xl overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute right-4 top-4 p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100">
          <X size={20} />
        </button>

        <img src={product.images[0]?.url || '/logo.png'} alt={product.name} className="w-full h-52 object-contain rounded-xl bg-slate-50 mb-4 border border-slate-100" />

        <div className="space-y-3">
          <div>
            <span className="text-xs font-semibold text-cyan-600 uppercase tracking-wider">{product.supplier || 'Rubén Darío'}</span>
            <h3 className="text-lg font-bold text-slate-900 leading-tight">{product.name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">Código: {product.barcode}</p>
          </div>

          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">${finalUnitPrice.toLocaleString('es-AR')}</span>
            {isWholesale && <span className="text-xs font-bold text-cyan-700 bg-cyan-100 px-2 py-0.5 rounded-full">Precio Mayorista</span>}
          </div>

          {product.description && <p className="text-xs text-slate-600">{product.description}</p>}

          {product.subTypes && product.subTypes.length > 0 && (
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Elige una variante / modelo:</label>
              <div className="grid grid-cols-2 gap-2">
                {product.subTypes.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`p-2 rounded-lg border text-xs text-left transition ${selectedVariant?.id === v.id ? 'border-cyan-500 bg-cyan-50 font-bold text-cyan-800' : 'border-slate-200 text-slate-700'}`}
                  >
                    <span>{v.name}</span>
                    {v.priceModifier !== 0 && <span className="block text-[10px] text-slate-500">{v.priceModifier > 0 ? `+$${v.priceModifier}` : `-$${Math.abs(v.priceModifier)}`}</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3 pt-2">
            <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold">-</button>
              <span className="px-4 py-2 text-sm font-bold text-slate-800">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold">+</button>
            </div>
            <button
              onClick={handleAdd}
              className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center space-x-2 transition ${added ? 'bg-emerald-500 text-white' : 'bg-cyan-400 hover:bg-cyan-300 text-slate-950'}`}
            >
              {added ? <><Check size={18} /><span>¡Agregado al carrito!</span></> : <><ShoppingCart size={18} /><span>Agregar al Carrito</span></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
