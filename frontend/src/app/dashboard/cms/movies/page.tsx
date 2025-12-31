'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Plus, Film, Loader2, Play, Calendar, MoreVertical } from 'lucide-react';
import CreateContentModal from '@/components/cms/CreateContentModal';

export default function CMSMoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await api.get('/creator/content', { params: { type: 'movie' } });
      setMovies(res.data.data);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchMovies(); }, []);

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <Film className="text-purple-500" size={32} />
            Movies Library
          </h1>
          <p className="text-gray-400 mt-2">Manage standalone feature films and shorts.</p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)} 
          className="group relative px-8 py-3 bg-white text-black font-bold rounded-full shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2 overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-shimmer" />
          <Plus size={20} /> Create Movie
        </button>
      </div>

      {/* GRID */}
      {loading ? (
        <div className="flex justify-center py-40"><Loader2 className="animate-spin text-purple-500" size={48} /></div>
      ) : movies.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl bg-white/5">
          <Film className="mx-auto text-gray-600 mb-4" size={48} />
          <p className="text-gray-400">No movies uploaded yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <div key={movie._id} className="group relative bg-[#161b22] rounded-2xl overflow-hidden shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-purple-500/20">
              
              {/* Poster Image */}
              <div className="aspect-[2/3] relative overflow-hidden">
                <img 
                  src={movie.coverImage || movie.description} 
                  alt={movie.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                />
                
                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent opacity-60" />
                
                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px] bg-black/20">
                  <div className="size-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-xl transform scale-50 group-hover:scale-100 transition-transform">
                    <Play fill="currentColor" size={24} />
                  </div>
                </div>

                {/* Top Badge */}
                <div className="absolute top-3 left-3">
                  <span className="px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold text-white uppercase tracking-wider">
                    {movie.category || 'Movie'}
                  </span>
                </div>
              </div>

              {/* Info Card */}
              <div className="p-4 relative">
                {/* Glowing line on top */}
                <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent group-hover:via-purple-500/50 transition-colors" />
                
                <h3 className="font-bold text-white truncate text-lg group-hover:text-purple-400 transition-colors">{movie.title}</h3>
                
                <div className="flex items-center justify-between mt-3 text-xs text-gray-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Calendar size={12} /> {new Date(movie.createdAt).toLocaleDateString()}
                  </span>
                  <button className="hover:text-white transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateContentModal 
          type="movie" 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={fetchMovies} 
        />
      )}
    </div>
  );
}