'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Plus, ArrowLeft, Loader2, Calendar, Play, Clock, Layers } from 'lucide-react';
import AddEpisodeModal from '@/components/cms/AddEpisodeModal';

export default function ManageSeriesPage() {
  const { id } = useParams(); // Series ID
  const router = useRouter();
  
  const [series, setSeries] = useState<any>(null);
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      // Fetch episodes (We assume series details might need a separate call or can be inferred, 
      // but typically we need a 'getSeriesDetails' endpoint. For now we use the episodes list logic 
      // or assume we have the data. Let's just fetch episodes and maybe the series header info if available).
      // Ideally, create a GET /creator/series/:id endpoint. For now, let's reuse what we have.
      
      const [epRes] = await Promise.all([
        api.get(`/creator/series/${id}/episodes`),
        // api.get(`/creator/series/${id}`) // You might need to add this endpoint to get Title/Cover
      ]);
      setEpisodes(epRes.data.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-6 border-b border-white/5 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowLeft size={20} className="text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-black text-white">Manage Episodes</h1>
            <p className="text-gray-400 text-sm mt-1">Upload and organize episodes for this series.</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all hover:scale-105"
        >
          <Plus size={20} /> Add Episode
        </button>
      </div>

      {/* Episode List */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : episodes.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-2xl bg-white/5">
          <Layers className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400">No episodes found.</p>
          <p className="text-xs text-gray-500 mt-1">Click "Add Episode" to start building this series.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {episodes.map((ep) => (
            <div key={ep._id} className="flex flex-col md:flex-row gap-4 bg-[#161b22] border border-white/5 p-4 rounded-xl hover:border-white/10 transition-colors group">
              
              {/* Thumbnail */}
              <div className="w-full md:w-48 aspect-video bg-black/50 rounded-lg overflow-hidden relative flex-shrink-0">
                <img src={ep.thumbnail || ep.video} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play size={24} className="text-white fill-current" />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-1">
                  <span className="px-2 py-0.5 bg-primary/20 text-primary text-[10px] font-bold rounded uppercase tracking-wider border border-primary/20">
                    Episode {ep.order}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={10} /> {new Date(ep.releaseDate || ep.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{ep.title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{ep.synopsis || 'No synopsis provided.'}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <AddEpisodeModal 
          seriesId={id as string}
          nextOrder={episodes.length + 1}
          onClose={() => setIsModalOpen(false)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}