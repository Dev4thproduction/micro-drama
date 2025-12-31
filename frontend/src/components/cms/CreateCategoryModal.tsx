'use client';

import { useState } from 'react';
import api from '@/lib/api';
import { X, Layers, Loader2, Check } from 'lucide-react';

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateCategoryModal({ onClose, onSuccess }: Props) {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await api.post('/creator/categories', { name });
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to create category');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#161b22] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0f1117]">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="text-primary" size={20} />
            New Category
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-400 uppercase">Category Name</label>
            <input 
              autoFocus
              type="text" 
              placeholder="e.g. Sci-Fi, Romance, Action"
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
              value={name} 
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || !name.trim()}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 transition-all shadow-lg shadow-primary/20"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <><Check size={18} /> Create Category</>}
          </button>
        </form>

      </div>
    </div>
  );
}