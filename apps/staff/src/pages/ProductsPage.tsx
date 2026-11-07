import React, { useEffect, useState } from 'react';
import { ProductDto } from '@libreriard/shared';
import { ProductService } from '../services/product.service';
import { ProductModal } from '../components/products/ProductModal';
import { ExcelImportModal } from '../components/products/ExcelImportModal';
import { MassiveImportModal } from '../components/products/MassiveImportModal';
import { PriceHistoryModal } from '../components/products/PriceHistoryModal';
import { Pagination } from '../components/common/Pagination';
import { Plus, Search, Edit2, Trash2, Power, Download, Upload, Layers, ArrowUpDown, History } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExcelOpen, setIsExcelOpen] = useState(false);
  const [isMassiveOpen, setIsMassiveOpen] = useState(false);
  const [isPriceHistoryOpen, setIsPriceHistoryOpen] = useState(false);
  const [priceHistoryProduct, setPriceHistoryProduct] = useState<ProductDto | null>(null);
  const [exporting, setExporting] = useState(false);
  const [loading, setLoading] = useState(true);
  const productService = new ProductService();

  const loadProducts = async () => {
    setLoading(true);
    const res = await productService.getProducts({
      search: search.trim(),
      page,
      limit: 15,
      sortBy,
      sortOrder
    });
    if (res.success && res.data) {
      setProducts(res.data);
      setTotalItems(res.total || res.data.length);
      setTotalPages(res.totalPages || Math.ceil((res.total || res.data.length) / 15) || 1);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, [search, page, sortBy, sortOrder]);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const blob = await productService.exportExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `catalogo-productos-ruben-dario-${new Date().toISOString().split('T')[0]}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      alert('Error al descargar catálogo en Excel');
    } finally {
      setExporting(false);
    }
  };

  const handleToggleActive = async (id: string) => {
    await productService.toggleActive(id);
    loadProducts();
  };

  const handleDelete = async (id: string) => {
    if (confirm('¿Está seguro de eliminar este producto?')) {
      await productService.deleteProduct(id);
      loadProducts();
    }
  };

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, código de barras..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportExcel}
            disabled={exporting}
            className="px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
            title="Descargar catálogo completo en Excel"
          >
            <Download size={14} className="text-emerald-400" />
            <span>{exporting ? 'Exportando...' : 'Exportar Excel'}</span>
          </button>

          <button
            onClick={() => setIsExcelOpen(true)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
            title="Modificar y subir Excel de productos"
          >
            <Upload size={14} className="text-cyan-400" />
            <span>Importar Excel</span>
          </button>

          <button
            onClick={() => setIsMassiveOpen(true)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
            title="Carga masiva de miles de productos por archivo"
          >
            <Layers size={14} className="text-amber-400" />
            <span>Carga Masiva</span>
          </button>

          <button
            onClick={() => {
              setPriceHistoryProduct(null);
              setIsPriceHistoryOpen(true);
            }}
            className="px-3 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition"
            title="Ver historial de cambios de precios"
          >
            <History size={14} className="text-cyan-400" />
            <span>Historial Precios</span>
          </button>

          <button
            onClick={() => {
              setSelectedProduct(null);
              setIsModalOpen(true);
            }}
            className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
          >
            <Plus size={15} /> <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden p-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/60 text-slate-400 text-[10px] uppercase border-b border-slate-800 font-bold">
              <tr>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Producto</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-3">Código</th>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort('retailPrice')}>
                  <div className="flex items-center gap-1">
                    <span>P. Minorista</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort('wholesalePrice')}>
                  <div className="flex items-center gap-1">
                    <span>P. Mayorista</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-3">Estado</th>
                <th className="p-3 cursor-pointer" onClick={() => toggleSort('createdAt')}>
                  <div className="flex items-center gap-1">
                    <span>Fecha</span>
                    <ArrowUpDown size={12} />
                  </div>
                </th>
                <th className="p-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Cargando productos...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No se encontraron productos.
                  </td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3 flex items-center space-x-3">
                      <img
                        src={p.images[0]?.url || '/logo.png'}
                        alt={p.name}
                        className="w-9 h-9 object-cover rounded-lg bg-slate-900 border border-slate-800"
                      />
                      <div>
                        <p className="font-semibold text-white">{p.name}</p>
                        <p className="text-[11px] text-slate-500">{p.supplier || 'Sin marca / proveedor'}</p>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-slate-400">{p.barcode || '-'}</td>
                    <td className="p-3 font-semibold text-slate-200">
                      {p.retailPrice ? (
                        `$${p.retailPrice.toLocaleString('es-AR')}`
                      ) : (
                        <span className="text-slate-600">Sin precio</span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-cyan-400">
                      {p.wholesalePrice ? (
                        `$${p.wholesalePrice.toLocaleString('es-AR')}`
                      ) : (
                        <span className="text-slate-600">Sin precio</span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => handleToggleActive(p.id)}
                        title="Clic para activar/desactivar"
                        className="flex items-center gap-1.5 cursor-pointer"
                      >
                        <Badge label={p.isActive ? 'Activo' : 'Inactivo'} variant={p.isActive ? 'green' : 'slate'} />
                        <Power
                          size={13}
                          className={p.isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-300'}
                        />
                      </button>
                    </td>
                    <td className="p-3 text-slate-500 text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString('es-AR')}
                    </td>
                    <td className="p-3 text-right space-x-1 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setPriceHistoryProduct(p);
                          setIsPriceHistoryOpen(true);
                        }}
                        title="Ver historial de precios"
                        className="text-slate-400 hover:text-amber-400 p-1.5 hover:bg-slate-900 rounded-lg transition"
                      >
                        <History size={15} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedProduct(p);
                          setIsModalOpen(true);
                        }}
                        className="text-slate-400 hover:text-cyan-400 p-1.5 hover:bg-slate-900 rounded-lg transition"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="text-slate-400 hover:text-rose-400 p-1.5 hover:bg-slate-900 rounded-lg transition"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-3 pb-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalItems}
            pageSize={15}
            onPageChange={setPage}
          />
        </div>
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSaved={loadProducts}
        product={selectedProduct}
      />

      <ExcelImportModal
        isOpen={isExcelOpen}
        onClose={() => setIsExcelOpen(false)}
        onSuccess={loadProducts}
      />

      <MassiveImportModal
        isOpen={isMassiveOpen}
        onClose={() => setIsMassiveOpen(false)}
        onSuccess={loadProducts}
      />

      <PriceHistoryModal
        product={priceHistoryProduct}
        isOpen={isPriceHistoryOpen}
        onClose={() => setIsPriceHistoryOpen(false)}
      />
    </div>
  );
};
