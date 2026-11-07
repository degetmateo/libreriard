import React, { useEffect, useState } from 'react';
import { ProductDto } from '@libreriard/shared';
import { CatalogService } from '../services/catalog.service';
import { useAuth } from '../context/AuthContext';
import { useConfirm } from '../context/ConfirmContext';
import { SEOHead } from '../components/common/SEOHead';
import { ProductCard } from '../components/catalog/ProductCard';
import { ProductDetailModal } from '../components/catalog/ProductDetailModal';
import { Pagination } from '../components/common/Pagination';
import { Search, Download, ArrowUpDown } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { user, isWholesale } = useAuth();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortOption, setSortOption] = useState('newest');
  const [downloading, setDownloading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { alert } = useConfirm();
  const catalogService = new CatalogService();

  const categories = ['Todas', 'Escolar', 'Comercial', 'Artística', 'Cuadernos', 'Escritura', 'Papelería'];

  const getSortParams = () => {
    switch (sortOption) {
      case 'priceAsc':
        return { sortBy: isWholesale ? 'wholesalePrice' : 'retailPrice', sortOrder: 'asc' };
      case 'priceDesc':
        return { sortBy: isWholesale ? 'wholesalePrice' : 'retailPrice', sortOrder: 'desc' };
      case 'nameAsc':
        return { sortBy: 'name', sortOrder: 'asc' };
      case 'nameDesc':
        return { sortBy: 'name', sortOrder: 'desc' };
      default:
        return { sortBy: 'createdAt', sortOrder: 'desc' };
    }
  };

  useEffect(() => {
    setLoading(true);
    const { sortBy, sortOrder } = getSortParams();
    const params: Record<string, string | number> = {
      page,
      limit: 20,
      sortBy,
      sortOrder
    };
    if (search.trim()) params.search = search.trim();
    if (category && category !== 'Todas') params.category = category;

    catalogService
      .getProducts(params)
      .then((res) => {
        if (res.success && res.data) {
          setProducts(res.data);
          setTotalItems(res.total || res.data.length);
          setTotalPages(res.totalPages || Math.ceil((res.total || res.data.length) / 20) || 1);
        }
      })
      .finally(() => setLoading(false));
  }, [search, category, page, sortOption]);

  const handleDownloadPriceList = async () => {
    setDownloading(true);
    try {
      const blob = await catalogService.downloadPriceList();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lista-precios-${isWholesale ? 'mayorista' : 'minorista'}-ruben-dario.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      await alert({
        title: 'Error de Descarga',
        message: 'No se pudo descargar la lista de precios. Asegúrese de haber iniciado sesión.',
        variant: 'danger',
      });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8">
      <SEOHead
        title="Artículos Escolares, Comerciales y Mayorista en Pacheco"
        canonicalPath="/"
        description="Librería Rubén Darío en General Pacheco: insumos escolares, comerciales y artísticos al por mayor y menor. Comprá online con retiro en local o envíos a todo el país."
      />

      {/* Hero Banner Section */}
      <section aria-label="Portada de Librería Rubén Darío" className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden border border-slate-800 shadow-xl">
        <div className="relative z-10 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-bold">
              Ventas Minoristas y Mayoristas
            </span>
            {user && (
              <button
                onClick={handleDownloadPriceList}
                disabled={downloading}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-bold transition shadow-sm"
              >
                <Download size={13} />
                <span>{downloading ? 'Descargando...' : `Descargar Lista ${isWholesale ? 'Mayorista' : 'Minorista'} (.xlsx)`}</span>
              </button>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight mb-3">
            Librería <span className="text-cyan-400">Rubén Darío</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-300 mb-6">
            Líderes en insumos escolares, artículos de oficina, papelería comercial y materiales artísticos al mejor precio en General Pacheco.
          </p>
          <div className="relative max-w-lg">
            <Search size={18} className="absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar productos, marcas, códigos..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 bg-slate-800/90 border border-slate-700 rounded-xl text-white placeholder-slate-400 text-sm focus:outline-none focus:border-cyan-400 shadow-inner"
              aria-label="Buscar en el catálogo"
            />
          </div>
        </div>
        <img
          src="/logo.png"
          alt="Librería Rubén Darío - Pacheco"
          width={256}
          height={256}
          className="absolute -right-8 -bottom-8 w-64 h-64 object-contain opacity-20 pointer-events-none"
        />
      </section>

      {/* Filter and Sort Bar */}
      <section aria-label="Filtros del catálogo" className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        {/* Category Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-2 flex-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setCategory(cat);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                category === cat || (!category && cat === 'Todas')
                  ? 'bg-slate-900 text-cyan-400 border border-cyan-500/40 shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 text-xs">
          <ArrowUpDown size={14} className="text-slate-400" />
          <select
            value={sortOption}
            onChange={(e) => {
              setSortOption(e.target.value);
              setPage(1);
            }}
            aria-label="Ordenar productos"
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-700 font-semibold focus:outline-none focus:border-cyan-400 shadow-sm"
          >
            <option value="newest">Más recientes</option>
            <option value="priceAsc">Menor precio</option>
            <option value="priceDesc">Mayor precio</option>
            <option value="nameAsc">Nombre (A - Z)</option>
            <option value="nameDesc">Nombre (Z - A)</option>
          </select>
        </div>
      </section>

      {/* Products Grid Section */}
      <section aria-label="Catálogo de productos">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center justify-between">
          <span>{category && category !== 'Todas' ? `Categoría: ${category}` : 'Catálogo Completo'}</span>
          <span className="text-xs font-normal text-slate-500">{totalItems} productos disponibles</span>
        </h2>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium">Cargando catálogo...</div>
        ) : products.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">
            No se encontraron productos en esta categoría o búsqueda.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onOpenDetails={setSelectedProduct} />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              totalItems={totalItems}
              pageSize={20}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>

      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
