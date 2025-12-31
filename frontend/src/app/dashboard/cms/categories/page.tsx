'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Trash2, Loader2, Tag, Layers } from 'lucide-react';
import CreateCategoryModal from '@/components/cms/CreateCategoryModal';

export default function CMSCategoriesPage() {
  const [categories, setCategories] = useState<{_id: string, name: string}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchCats = async () => {
    try {
      const res = await api.get('/creator/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchCats(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/creator/categories/${id}`);
      fetchCats();
    } catch (err) { alert('Failed to delete'); }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Layers className="text-primary" size={32} />
            Categories
          </h1>
          <p className="text-gray-400 mt-2">Manage genres and tags for your content.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="group px-6 py-3 bg-white text-black font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} /> Add Category
        </button>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
          <Layers className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400">No categories found.</p>
          <button onClick={() => setIsModalOpen(true)} className="text-primary mt-2 font-bold hover:underline">Create your first one</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map(cat => (
            <div key={cat._id} className="group relative p-6 rounded-2xl bg-[#161b22] border border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-primary/10">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-white/5 text-gray-400 group-hover:text-white group-hover:bg-primary/20 transition-colors">
                    <Tag size={18} />
                  </div>
                  <span className="font-bold text-lg text-gray-200 group-hover:text-white transition-colors">{cat.name}</span>
                </div>
                
                <button 
                  onClick={() => handleDelete(cat._id)} 
                  className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete Category"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL */}
      {isModalOpen && (
        <CreateCategoryModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchCats} 
        />
      )}
    </div>
  );
}