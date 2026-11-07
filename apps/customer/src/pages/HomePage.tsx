import React, { useEffect, useState } from 'react';
import { ProductDto } from '@libreriard/shared';
import { CatalogService } from '../services/catalog.service';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductDetailModal } from '../components/catalog/ProductDetailModal';
import { Search } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const catalogService = new CatalogService();

  const categories = ['Todas', 'Escolar', 'Comercial', 'Artística', 'Cuadernos', 'Escritura', 'Papelería'];

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { limit: '48' };
    if (search) params.search = search;
    if (category && category !== 'Todas') params.category = category;

    catalogService.getProducts(params).then(res => {
      if (res.success && res.data) setProducts(res.data);
    }).finally(() => setLoading(false));
  }, [search, category]);

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-bold mb-3">
            Ventas Minoristas y Mayoristas
          </span>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
            Librería <span className="text-cyan-400">Rubén Darío</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6">
            Líderes en insumos escolares, artículos de oficina, papelería comercial y materiales artísticos al mejor precio.
          </p>
          <div className="relative max-w-lg">
            <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos, marcas, códigos..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 shadow-inner"
            />
          </div>
        </div>
        <img src="/logo.png" alt="Librería Rubén Darío" className="absolute -right-8 -bottom-8 w-64 h-64 object-contain opacity-20 pointer-events-none" />
      </div>

      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              (category === cat || (!category && cat === 'Todas'))
                ? 'bg-slate-900 text-cyan-400 border border-cyan-500/40 shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div>
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Cargando catálogo...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No se encontraron productos en esta categoría o búsqueda.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} onOpenDetails={setSelectedProduct} />
            ))}
          </div>
        )}
      </div>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};

