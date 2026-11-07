import React from 'react';
import { ProductDto } from '@libreriard/shared';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
  product: ProductDto;
  onOpenDetails: (product: ProductDto) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenDetails }) => {
  const { isWholesale } = useAuth();
  const { addItem } = useCart();

  const rawPrice = isWholesale ? product.wholesalePrice : product.retailPrice;
  const hasPrice = typeof rawPrice === 'number';
  const hasVariants = product.subTypes && product.subTypes.length > 0;

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!hasPrice) {
      onOpenDetails(product);
      return;
    }
    if (hasVariants) {
      onOpenDetails(product);
    } else {
      addItem(product);
    }
  };

  return (
    <article
      onClick={() => onOpenDetails(product)}
      className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md hover:border-cyan-400 transition cursor-pointer flex flex-col justify-between group"
    >
      <div>
        <div className="relative aspect-square w-full bg-slate-50 rounded-xl overflow-hidden mb-3 flex items-center justify-center border border-slate-100">
          <img
            src={product.images[0]?.url || '/logo.png'}
            alt={`${product.name} - Librería Rubén Darío`}
            width={300}
            height={300}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-300"
          />
          {isWholesale && (
            <span className="absolute top-2 left-2 bg-cyan-500 text-slate-950 font-extrabold text-[10px] px-2 py-0.5 rounded-full shadow">
              MAYORISTA
            </span>
          )}
        </div>
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{product.supplier || 'Librería'}</span>
        <h3 className="text-sm font-bold text-slate-800 line-clamp-2 mt-0.5 leading-snug group-hover:text-cyan-600 transition">
          {product.name}
        </h3>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
        <div>
          {hasPrice ? (
            <>
              <span className="text-base font-black text-slate-900">${rawPrice.toLocaleString('es-AR')}</span>
              {isWholesale && typeof product.retailPrice === 'number' && (
                <span className="block text-[10px] text-slate-400 line-through">
                  ${product.retailPrice.toLocaleString('es-AR')}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs font-bold text-amber-600">Consultar precio</span>
          )}
        </div>
        <button
          onClick={handleQuickAdd}
          disabled={!hasPrice && !hasVariants}
          className="p-2 rounded-xl bg-slate-900 text-cyan-400 hover:bg-cyan-400 hover:text-slate-950 transition disabled:opacity-40"
          title={hasPrice ? (hasVariants ? 'Elegir opciones' : 'Agregar al carrito') : 'Ver detalles'}
          aria-label={`Comprar ${product.name}`}
        >
          <ShoppingCart size={16} />
        </button>
      </div>
    </article>
  );
};
