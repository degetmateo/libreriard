import React, { useEffect, useState } from 'react';
import { ProductDto } from '@libreriard/shared';
import { ProductService } from '../services/product.service';
import { ProductModal } from '../components/products/ProductModal';
import { Plus, Search, Edit2, Trash2, Power } from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductDto | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const productService = new ProductService();

  const loadProducts = async () => {
    setLoading(true);
    const res = await productService.getProducts({ search, limit: 50 });
    if (res.success && res.data) setProducts(res.data);
    setLoading(false);
  };

  useEffect(() => { loadProducts(); }, [search]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre, código de barras..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>
        <button onClick={() => { setSelectedProduct(null); setIsModalOpen(true); }} className="bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold px-4 py-2 rounded-lg text-sm flex items-center justify-center space-x-2 transition">
          <Plus size={16} /> <span>Nuevo Producto</span>
        </button>
      </div>

      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-300">
          <thead className="bg-slate-900/60 text-slate-400 text-xs uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">Producto</th>
              <th className="p-3">Código</th>
              <th className="p-3">P. Minorista</th>
              <th className="p-3">P. Mayorista</th>
              <th className="p-3">Estado</th>
              <th className="p-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {loading ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">Cargando productos...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-slate-500">No se encontraron productos.</td></tr>
            ) : products.map(p => (
              <tr key={p.id} className="hover:bg-slate-900/40">
                <td className="p-3 flex items-center space-x-3">
                  <img src={p.images[0]?.url || '/logo.png'} alt={p.name} className="w-9 h-9 object-cover rounded bg-slate-800 border border-slate-700" />
                  <div>
                    <p className="font-semibold text-white">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.supplier || 'Sin marca'}</p>
                  </div>
                </td>
                <td className="p-3 font-mono text-xs">{p.barcode || '-'}</td>
                <td className="p-3 font-semibold text-slate-200">{p.retailPrice ? `$${p.retailPrice.toLocaleString('es-AR')}` : <span className="text-xs text-slate-500">Sin precio</span>}</td>
                <td className="p-3 font-semibold text-cyan-400">{p.wholesalePrice ? `$${p.wholesalePrice.toLocaleString('es-AR')}` : <span className="text-xs text-slate-500">Sin precio</span>}</td>
                <td className="p-3">
                  <button onClick={() => handleToggleActive(p.id)} title="Clic para activar/desactivar" className="flex items-center gap-1.5 cursor-pointer">
                    <Badge label={p.isActive ? 'Activo' : 'Inactivo'} variant={p.isActive ? 'green' : 'slate'} />
                    <Power size={13} className={p.isActive ? 'text-emerald-400 hover:text-emerald-300' : 'text-slate-500 hover:text-slate-300'} />
                  </button>
                </td>
                <td className="p-3 text-right space-x-2">
                  <button onClick={() => { setSelectedProduct(p); setIsModalOpen(true); }} className="text-slate-400 hover:text-cyan-400 p-1"><Edit2 size={16} /></button>
                  <button onClick={() => handleDelete(p.id)} className="text-slate-400 hover:text-rose-400 p-1"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ProductModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSaved={loadProducts} product={selectedProduct} />
    </div>
  );
};
