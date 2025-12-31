'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Tv, Loader2, Layers, Star, Edit2, Trash2 } from 'lucide-react'; // Added Trash2
import CreateContentModal from '@/components/cms/CreateContentModal';
import EditSeriesModal from '@/components/cms/EditSeriesModal';

export default function CMSSeriesPage() {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSeries, setEditingSeries] = useState<any>(null);

  const fetchSeries = async () => {
    setLoading(true);
    try {
      const res = await api.get('/creator/content', { params: { type: 'series' } });
      setSeries(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchSeries(); }, []);

  // --- DELETE FUNCTION ---
  const handleDelete = async (seriesId: string) => {
    if (!confirm("Are you sure you want to delete this series? This will remove all episodes inside it.")) return;

    try {
      await api.delete(`/creator/series/${seriesId}`);
      // Optimistic update: remove from UI immediately
      setSeries(prev => prev.filter(s => s._id !== seriesId));
    } catch (err) {
      console.error(err);
      alert("Failed to delete series");
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Tv className="text-primary" size={32} />
            Series Library
          </h1>
          <p className="text-gray-400 mt-2">Manage multi-episode shows and seasons.</p>
        </div>
        
        <button 
          onClick={() => setIsCreateOpen(true)} 
          className="group px-8 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-full shadow-[0_0_20px_rgba(19,91,236,0.3)] hover:shadow-[0_0_30px_rgba(19,91,236,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
        >
          <Plus size={20} /> Create Series
        </button>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex justify-center py-40"><Loader2 className="animate-spin text-primary" size={48} /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {series.map((item) => (
            <div key={item._id} className="group relative bg-[#161b22] rounded-2xl overflow-hidden border border-white/5 hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10">
              
              {/* ACTION BUTTONS (Edit & Delete) */}
              <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                
                {/* Edit Button */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    setEditingSeries(item);
                  }}
                  className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-primary hover:text-white transition-colors shadow-lg"
                  title="Edit Series"
                >
                  <Edit2 size={16} />
                </button>

                {/* Delete Button */}
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(item._id);
                  }}
                  className="p-2 bg-black/60 backdrop-blur-md rounded-full text-white hover:bg-red-500 hover:text-white transition-colors shadow-lg"
                  title="Delete Series"
                >
                  <Trash2 size={16} />
                </button>

              </div>

              {/* CARD LINK */}
              <Link href={`/dashboard/cms/series/${item._id}`} className="block h-full">
                <div className="aspect-[2/3] relative overflow-hidden">
                  <img 
                    src={item.coverImage || item.description} 
                    alt={item.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent opacity-80" />
                  
                  {/* Episode Badge */}
                  <div className="absolute top-3 left-3">
                     <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded shadow-lg flex items-center gap-1">
                       <Layers size={10} /> {item.episodeCount || 0} Eps
                     </span>
                  </div>
                </div>

                <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-[#161b22] via-[#161b22]/90 to-transparent pt-12">
                  <h3 className="font-bold text-white truncate text-lg leading-tight group-hover:text-primary transition-colors">{item.title}</h3>
                  <div className="flex items-center gap-3 mt-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded">
                      <Star size={10} className="text-yellow-500" /> 4.8
                    </span>
                    <span className="bg-white/10 px-2 py-0.5 rounded text-gray-300">
                      {item.category || 'Series'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* CREATE MODAL */}
      {isCreateOpen && (
        <CreateContentModal 
          type="series" 
          onClose={() => setIsCreateOpen(false)} 
          onSuccess={fetchSeries} 
        />
      )}

      {/* EDIT MODAL */}
      {editingSeries && (
        <EditSeriesModal
          series={editingSeries}
          onClose={() => setEditingSeries(null)}
          onSuccess={() => {
            fetchSeries();
            setEditingSeries(null);
          }}
        />
      )}
    </div>
  );
}