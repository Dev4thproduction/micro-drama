'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import Navbar from '@/components/layout/Navbar'; // Import the new Navbar
import { Loader2, Zap, Play } from 'lucide-react';
import { clsx } from 'clsx';

function BrowseContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const initialQuery = searchParams.get('q') || '';
  const initialGenre = searchParams.get('genre') || 'All';

  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState(initialGenre);

  // Genre list
  const genres = ['All', 'Drama', 'Urban', 'Romance', 'Fantasy', 'Comedy', 'Thriller', 'Mystery', 'Sci-Fi', 'Action'];

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params: any = {};
        if (query) params.q = query;
        if (activeGenre !== 'All') params.genre = activeGenre;

        const res = await api.get('/content/browse', { params });
        setResults(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(fetchResults, 500);
    return () => clearTimeout(debounce);
  }, [query, activeGenre]);

  const handleGenreClick = (genre: string) => {
    setActiveGenre(genre);
    const newParams = new URLSearchParams(searchParams.toString());
    if (genre === 'All') newParams.delete('genre');
    else newParams.set('genre', genre);
    router.replace(`/browse?${newParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-display flex flex-col">
      
      {/* 1. Shared Navbar */}
      <Navbar />

      <main className="flex-grow relative">
        
        {/* 2. Explore Header (with Purple/Primary Gradient) */}
        <section className="relative py-16 px-4 md:px-8 overflow-hidden">
          {/* Background Effects */}
          <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-[#0f1117] to-[#0f1117]" />
          <div className="absolute top-0 right-0 w-125 h-125 bg-primary/20 blur-[120px] rounded-full pointer-events-none translate-x-1/3 -translate-y-1/3" />

          <div className="max-w-7xl mx-auto relative z-10 flex justify-between items-center">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                Explore <span className="text-primary">Micro-Drama</span>
              </h1>
              <p className="text-gray-400 text-lg md:text-xl font-light max-w-lg">
                {query ? `Showing results for "${query}"` : 'Dive into bite-sized stories tailored for you.'}
              </p>
            </div>
            
            {/* Decorative Grid */}
            <div className="hidden md:grid grid-cols-2 gap-3 opacity-30 rotate-6">
              <div className="w-16 h-24 rounded-lg border border-white/20 bg-white/5"></div>
              <div className="w-16 h-24 rounded-lg border border-primary/50 bg-primary/10"></div>
              <div className="w-16 h-24 rounded-lg border border-white/20 bg-white/5 mt-4"></div>
              <div className="w-16 h-24 rounded-lg border border-white/20 bg-white/5 -mt-4"></div>
            </div>
          </div>
        </section>

        {/* 3. Sticky Genre Bar */}
        <section className="sticky top-16 z-40 bg-[#0f1117]/95 backdrop-blur-sm py-4 px-4 md:px-8 border-b border-white/5">
          <div className="max-w-7xl mx-auto overflow-x-auto pb-1 scrollbar-hide">
            <div className="flex space-x-2 min-w-max">
              {genres.map((g) => (
                <button
                  key={g}
                  onClick={() => handleGenreClick(g)}
                  className={clsx(
                    "px-5 py-2 rounded-full text-sm font-bold transition-all duration-300",
                    activeGenre === g
                      ? "bg-primary text-white shadow-[0_0_15px_rgba(139,47,201,0.4)]"
                      : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 4. Results Grid */}
        <section className="max-w-7xl mx-auto px-4 md:px-8 py-8 pb-32">
          {loading ? (
             <div className="flex justify-center py-40"><Loader2 className="animate-spin text-primary" size={48} /></div>
          ) : results.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-32 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 mx-4">
                <p className="text-gray-400 text-lg">No series found matching your criteria.</p>
                <button onClick={() => {setQuery(''); setActiveGenre('All');}} className="mt-4 text-primary font-bold hover:underline">Clear Filters</button>
             </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {results.map((item) => (
                <Link 
                  href={`/series/${item._id}`} 
                  key={item._id} 
                  className="group relative block bg-[#161b22] rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ring-1 ring-white/5 hover:ring-primary/50"
                >
                  {/* Poster Image */}
                  <div className="aspect-[2/3] relative overflow-hidden">
                    <img 
                      src={item.coverImage} 
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                    />
                    
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-transparent to-transparent opacity-90" />
                    
                    {/* Hover Play Icon */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[1px]">
                         <div className="p-3 bg-white/10 rounded-full border border-white/20 backdrop-blur-md">
                            <Play fill="white" className="text-white" size={20} />
                         </div>
                    </div>

                    {/* Content Info (Always visible at bottom) */}
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white font-bold text-sm md:text-base leading-tight truncate drop-shadow-md group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
                           {item.category || 'Series'}
                        </span>
                        <span className="text-[10px] text-gray-500">• {item.episodeCount || 0} Eps</span>
                      </div>
                    </div>

                    {/* Trending Badge */}
                    {item.tags?.includes('Trending') && (
                      <div className="absolute top-2 right-2">
                         <div className="p-1.5 bg-primary/90 rounded-full text-white shadow-lg backdrop-blur-md">
                           <Zap size={10} fill="currentColor" />
                         </div>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

      </main>
      
      {/* NO FOOTER HERE as requested */}
    </div>
  );
}

export default function BrowsePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0f1117] flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
      <BrowseContent />
    </Suspense>
  );
}