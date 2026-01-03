'use client';

import { useState, useEffect } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import api from '@/lib/api';
import { X, Loader2, CheckCircle, Image as ImageIcon, Save } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  series: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditSeriesModal({ series, onClose, onSuccess }: Props) {
  const [categories, setCategories] = useState<{ _id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: series.title || '',
    description: series.description || '',
    category: series.category || ''
  });

  // Image State
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState(series.coverImage || '');

  // Fetch Categories
  useEffect(() => {
    api.get('/creator/categories').then(res => setCategories(res.data.data));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let coverImageUrl = series.coverImage; // Default to old image

      // 1. Upload new image ONLY if user selected one
      if (thumbnail) {
        const thumbRes = await uploadToCloudinary(thumbnail, 'image');
        coverImageUrl = thumbRes.url;
      }

      // 2. Update Backend
      await api.put(`/creator/series/${series._id}`, {
        ...formData,
        coverImage: coverImageUrl
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to update series');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#161b22] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0f1117]">
          <h2 className="text-xl font-bold text-white">Edit Series</h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Inputs */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                <input
                  type="text" required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                <select
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none appearance-none"
                  value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map(c => <option key={c._id} value={c.name} className="bg-gray-900">{c.name}</option>)}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Description</label>
                <textarea
                  rows={4}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Right: Cover Image */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-400 uppercase">Cover Image</label>
              <label className={clsx(
                "flex flex-col items-center justify-center w-full h-full min-h-[250px] rounded-xl border-2 border-dashed cursor-pointer transition-all relative overflow-hidden group",
                thumbnail ? "border-primary/50" : "border-white/10 hover:border-white/30"
              )}>
                {/* Preview Logic */}
                <img
                  src={thumbnail ? URL.createObjectURL(thumbnail) : previewUrl}
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                />

                <div className="relative z-10 flex flex-col items-center drop-shadow-md">
                  {thumbnail ? (
                    <>
                      <CheckCircle className="text-primary mb-2" size={32} />
                      <span className="text-sm font-bold text-white">New Image Selected</span>
                    </>
                  ) : (
                    <>
                      <div className="p-3 rounded-full bg-black/50 mb-2"><ImageIcon size={24} /></div>
                      <span className="text-sm font-medium text-white">Click to Change</span>
                    </>
                  )}
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => setThumbnail(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-white/5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:bg-white/5">Cancel</button>
            <button
              type="submit" disabled={loading}
              className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Update Series</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}