import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { ProductDto, CreateProductDto, RetailPriceTier } from '@libreriard/shared';
import { ProductService } from '../../services/product.service';
import { CategoryTagSelector } from './CategoryTagSelector';
import { RetailPriceTiersEditor } from './RetailPriceTiersEditor';
import { Upload, Trash2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
  product?: ProductDto | null;
}

export const ProductModal: React.FC<Props> = ({ isOpen, onClose, onSaved, product }) => {
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [retailPrice, setRetailPrice] = useState('');
  const [wholesalePrice, setWholesalePrice] = useState('');
  const [retailPriceTiers, setRetailPriceTiers] = useState<RetailPriceTier[]>([]);
  const [supplier, setSupplier] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [images, setImages] = useState<{ url: string; publicId?: string; isPrimary: boolean }[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const productService = new ProductService();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setBarcode(product.barcode || '');
      setDescription(product.description || '');
      setRetailPrice(product.retailPrice !== null && product.retailPrice !== undefined ? String(product.retailPrice) : '');
      setWholesalePrice(product.wholesalePrice !== null && product.wholesalePrice !== undefined ? String(product.wholesalePrice) : '');
      setRetailPriceTiers(product.retailPriceTiers || []);
      setSupplier(product.supplier || '');
      setCategories(product.categories || []);
      setTags(product.tags || []);
      setImages(product.images || []);
      setIsActive(product.isActive);
    } else {
      setName(''); setBarcode(''); setDescription(''); setRetailPrice(''); setWholesalePrice('');
      setRetailPriceTiers([]); setSupplier(''); setCategories([]); setTags([]); setImages([]); setIsActive(true);
    }
  }, [product, isOpen]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await productService.uploadImage(file);
      if (res.success && res.data) {
        setImages(prev => [...prev, { url: res.data!.url, publicId: res.data!.publicId, isPrimary: prev.length === 0 }]);
      }
    } finally { setUploading(false); }
  };

  const handleDeleteImage = async (index: number) => {
    const img = images[index];
    if (img.publicId) {
      await productService.deleteImage(img.publicId);
    }
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const dto: CreateProductDto = {
      name: name.trim(),
      barcode: barcode.trim() || undefined,
      description: description.trim(),
      retailPrice: retailPrice !== '' ? parseFloat(retailPrice) : null,
      wholesalePrice: wholesalePrice !== '' ? parseFloat(wholesalePrice) : null,
      retailPriceTiers,
      supplier: supplier.trim(),
      categories, tags, images, isActive
    };
    const res = product ? await productService.updateProduct(product.id, dto) : await productService.createProduct(dto);
    if (res.success) { onSaved(); onClose(); } else { setError(res.message || 'Error al guardar producto'); }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={product ? 'Editar Producto' : 'Nuevo Producto'} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-3 max-h-[75vh] overflow-y-auto pr-1">
        {error && <div className="p-2.5 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-lg">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div><label className="text-xs text-slate-400 font-medium">Nombre (Obligatorio) *</label><input required value={name} onChange={e => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" /></div>
          <div><label className="text-xs text-slate-400 font-medium">Código de Barras (Opcional)</label><input value={barcode} onChange={e => setBarcode(e.target.value)} placeholder="Opcional" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white font-mono" /></div>
          <div><label className="text-xs text-slate-400 font-medium">Precio Minorista Base ($)</label><input type="number" step="0.01" value={retailPrice} onChange={e => setRetailPrice(e.target.value)} placeholder="Sin precio" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" /></div>
          <div><label className="text-xs text-slate-400 font-medium">Precio Mayorista ($)</label><input type="number" step="0.01" value={wholesalePrice} onChange={e => setWholesalePrice(e.target.value)} placeholder="Sin precio" className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" /></div>
        </div>
        <RetailPriceTiersEditor tiers={retailPriceTiers} onChange={setRetailPriceTiers} />
        <div><label className="text-xs text-slate-400 font-medium">Proveedor / Marca</label><input value={supplier} onChange={e => setSupplier(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm text-white" /></div>
        <div><label className="text-xs text-slate-400 font-medium">Descripción</label><textarea rows={2} value={description} onChange={e => setDescription(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white" /></div>
        <CategoryTagSelector selectedCategories={categories} selectedTags={tags} onChangeCategories={setCategories} onChangeTags={setTags} />
        <div className="flex items-center justify-between pt-1">
          <label className="text-xs text-slate-400 font-medium flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} className="rounded bg-slate-800 border-slate-700 text-cyan-400" />
            <span>Producto Activo / Disponible</span>
          </label>
          <div>
            <input type="file" accept="image/*" id="prod-img-up" className="hidden" onChange={handleImageUpload} />
            <label htmlFor="prod-img-up" className="cursor-pointer bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded-lg text-xs text-cyan-400 flex items-center gap-1"><Upload size={14} /><span>{uploading ? 'Subiendo...' : 'Subir Imagen'}</span></label>
          </div>
        </div>
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {images.map((img, i) => (
              <div key={i} className="relative group w-14 h-14 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex items-center justify-center">
                <img src={img.url} alt="Producto" className="w-full h-full object-contain p-1" />
                <button type="button" onClick={() => handleDeleteImage(i)} className="absolute inset-0 bg-rose-950/80 text-rose-300 opacity-0 group-hover:opacity-100 flex items-center justify-center transition" title="Eliminar imagen">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs">Cancelar</button>
          <button type="submit" className="px-4 py-2 bg-cyan-400 text-slate-950 font-bold rounded-lg text-xs">Guardar Producto</button>
        </div>
      </form>
    </Modal>
  );
};
