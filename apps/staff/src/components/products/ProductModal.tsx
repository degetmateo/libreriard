import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ProductDto, CreateProductDto } from '@libreriard/shared';
import { ProductService } from '../../services/product.service';
import { Upload, Plus, Trash2 } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: ProductDto | null;
}

export const ProductModal: React.FC<ProductModalProps> = ({ isOpen, onClose, onSaved, product }) => {
  const [formData, setFormData] = useState<CreateProductDto>({
    name: '', barcode: '', description: '', retailPrice: 0, wholesalePrice: 0,
    supplier: '', categories: [], tags: [], images: [], subTypes: []
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const productService = new ProductService();

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name, barcode: product.barcode, description: product.description,
        retailPrice: product.retailPrice, wholesalePrice: product.wholesalePrice,
        supplier: product.supplier, categories: product.categories, tags: product.tags,
        images: product.images, subTypes: product.subTypes, isActive: product.isActive
      });
    } else {
      setFormData({
        name: '', barcode: '', description: '', retailPrice: 0, wholesalePrice: 0,
        supplier: '', categories: [], tags: [], images: [], subTypes: []
      });
    }
  }, [product, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await productService.uploadImage(file);
      if (res.success && res.data) {
        setFormData(p => ({
          ...p,
          images: [...(p.images || []), { url: res.data!.url, publicId: res.data!.publicId, isPrimary: (p.images?.length || 0) === 0 }]
        }));
      }
    } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const res = product
      ? await productService.updateProduct(product.id, formData)
      : await productService.createProduct(formData);

    if (res.success) {
      onSaved();
      onClose();
    } else {
      setError(res.message || 'Error al guardar el producto');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Editar Producto' : 'Nuevo Producto'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
        {error && <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-slate-400 font-medium">Nombre</label>
            <input required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Código de Barras</label>
            <input required value={formData.barcode} onChange={e => setFormData({ ...formData, barcode: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Precio Minorista ($)</label>
            <input type="number" step="0.01" required value={formData.retailPrice} onChange={e => setFormData({ ...formData, retailPrice: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Precio Mayorista ($)</label>
            <input type="number" step="0.01" required value={formData.wholesalePrice} onChange={e => setFormData({ ...formData, wholesalePrice: parseFloat(e.target.value) || 0 })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
          </div>
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium">Proveedor</label>
          <input value={formData.supplier} onChange={e => setFormData({ ...formData, supplier: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" />
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium">Imágenes</label>
          <div className="flex items-center space-x-3 mt-1">
            <input type="file" accept="image/*" id="img-up" className="hidden" onChange={handleImageUpload} />
            <label htmlFor="img-up" className="cursor-pointer bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-cyan-400 flex items-center space-x-1">
              <Upload size={14} /> <span>{uploading ? 'Subiendo...' : 'Subir Imagen'}</span>
            </label>
            {formData.images?.map((img, i) => (
              <img key={i} src={img.url} alt="Prod" className="w-10 h-10 object-cover rounded border border-slate-700" />
            ))}
          </div>
        </div>
        <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs">Guardar</button>
        </div>
      </form>
    </Modal>
  );
};
