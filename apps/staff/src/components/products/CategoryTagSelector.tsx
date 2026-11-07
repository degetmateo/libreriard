import React, { useEffect, useState } from 'react';
import { SettingsService } from '../../services/settings.service';
import { Plus } from 'lucide-react';

interface CategoryTagSelectorProps {
  selectedCategories: string[];
  selectedTags: string[];
  onChangeCategories: (cats: string[]) => void;
  onChangeTags: (tags: string[]) => void;
}

export const CategoryTagSelector: React.FC<CategoryTagSelectorProps> = ({
  selectedCategories, selectedTags, onChangeCategories, onChangeTags
}) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [newCat, setNewCat] = useState('');
  const [newTag, setNewTag] = useState('');
  const settingsService = new SettingsService();

  useEffect(() => {
    settingsService.getSettings().then(res => {
      if (res.success && res.data?.catalogMetadata) {
        setCategories(res.data.catalogMetadata.categories || []);
        setTags(res.data.catalogMetadata.tags || []);
      }
    });
  }, []);

  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    const item = newCat.trim();
    await settingsService.addCategory(item);
    if (!categories.includes(item)) setCategories(c => [...c, item]);
    if (!selectedCategories.includes(item)) onChangeCategories([...selectedCategories, item]);
    setNewCat('');
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) return;
    const item = newTag.trim().toLowerCase();
    await settingsService.addTag(item);
    if (!tags.includes(item)) setTags(t => [...t, item]);
    if (!selectedTags.includes(item)) onChangeTags([...selectedTags, item]);
    setNewTag('');
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-slate-400 font-medium block mb-1">Categorías</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {categories.map(c => {
            const isSel = selectedCategories.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() => onChangeCategories(isSel ? selectedCategories.filter(x => x !== c) : [...selectedCategories, c])}
                className={`px-2 py-0.5 rounded text-xs transition ${isSel ? 'bg-cyan-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
              >
                {c}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Nueva categoría..." value={newCat} onChange={e => setNewCat(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white" />
          <button type="button" onClick={handleAddCategory} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-cyan-400 rounded-lg text-xs flex items-center gap-1"><Plus size={12} /><span>Agregar</span></button>
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-400 font-medium block mb-1">Etiquetas (Tags)</label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {tags.map(t => {
            const isSel = selectedTags.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() => onChangeTags(isSel ? selectedTags.filter(x => x !== t) : [...selectedTags, t])}
                className={`px-2 py-0.5 rounded text-xs transition ${isSel ? 'bg-emerald-400 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}
              >
                #{t}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2">
          <input type="text" placeholder="Nueva etiqueta..." value={newTag} onChange={e => setNewTag(e.target.value)} className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white" />
          <button type="button" onClick={handleAddTag} className="px-2 py-1 bg-slate-700 hover:bg-slate-600 text-emerald-400 rounded-lg text-xs flex items-center gap-1"><Plus size={12} /><span>Agregar</span></button>
        </div>
      </div>
    </div>
  );
};

