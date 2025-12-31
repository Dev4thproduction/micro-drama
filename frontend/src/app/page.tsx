'use client';

import Link from 'next/link';
import api from '@/lib/api';
// 1. Import the shared Navbar
import Navbar from '@/components/layout/Navbar'; 
import { 
  Zap, Play, Bookmark, Flame, Clock, 
  ChevronRight, Loader2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { clsx } from 'clsx';

export default function HomePage() {
  // Note: 'user', 'logout', and 'router' are removed from here 
  // because the Navbar component now handles auth and navigation.
  
  // Data State
  const [data, setData] = useState<any>({ featured: [], trending: [], genres: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);

  // 1. Fetch Real Data from Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/content/home');
        setData(res.data.data);
      } catch (err) {
        console.error("Failed to fetch home content", err);
        setError("Failed to load content. Is the server running?");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // 2. Carousel Autoplay
  useEffect(() => {
    if (!data.featured || data.featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % data.featured.length);
    }, 6000); 
    return () => clearInterval(timer);
  }, [data.featured?.length]);

  if (loading) return <div className="min-h-screen bg-[#0f1117] flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={40} /></div>;
  if (error) return <div className="min-h-screen bg-[#0f1117] flex items-center justify-center text-red-400">{error}</div>;

  return (
    <div className="min-h-screen bg-[#0f1117] text-white font-display selection:bg-primary/30 overflow-x-hidden flex flex-col">
      
      {/* ---------------- SHARED NAVBAR ---------------- */}
      <Navbar />

      {/* ---------------- HERO CAROUSEL ---------------- */}
      <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden group">
        {data.featured.map((item: any, index: number) => (
          <div 
            key={item._id}
            className={clsx(
              "absolute inset-0 transition-opacity duration-1000 ease-in-out",
              index === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {/* Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center animate-[slowZoom_20s_infinite_alternate]"
              style={{ backgroundImage: `url("${item.coverImage}")` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-[#0f1117] via-[#0f1117]/40 to-black/30" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#0f1117] via-[#0f1117]/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-20 h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pb-20 pt-10">
              <div className="max-w-3xl space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 text-xs font-bold backdrop-blur-md flex items-center gap-1.5">
                    <Flame size={12} className="fill-current" /> Trending
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/10 text-white border border-white/10 text-xs font-bold backdrop-blur-md">
                    {item.tags?.[0] || 'Drama'}
                  </span>
                </div>

                <h1 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter text-white drop-shadow-2xl">
                  {item.title}
                </h1>
                
                <p className="text-lg text-gray-300 line-clamp-3 max-w-xl font-light leading-relaxed">
                  {item.description}
                </p>

                <div className="flex items-center gap-4 pt-4">
                  <Link href={`/watch/${item._id}`}>
                    <button className="h-14 px-8 rounded-2xl bg-white text-black font-bold hover:bg-gray-200 transition-all flex items-center gap-3 shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:scale-105 active:scale-95">
                      <Play size={20} fill="currentColor" /> Watch Now
                    </button>
                  </Link>
                  <button className="size-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center border border-white/10 transition-colors backdrop-blur-md hover:scale-105">
                    <Bookmark size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Carousel Indicators */}
        <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center gap-3">
          {data.featured.map((_: any, idx: number) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={clsx(
                "h-1.5 rounded-full transition-all duration-300",
                idx === currentSlide ? "w-8 bg-primary shadow-[0_0_10px_rgba(139,47,201,0.5)]" : "w-2 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>
      </section>

      {/* ---------------- MAIN CONTENT ---------------- */}
      <main className="relative z-20 -mt-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 pb-20">
        
        {/* Trending Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500 border border-orange-500/20">
                <Flame size={20} fill="currentColor" />
              </div>
              Trending Series
            </h2>
            <Link href="/browse?genre=Trending" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 group">
              View All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {data.trending.length === 0 ? (
              [1,2,3,4,5].map(i => <div key={i} className="aspect-[2/3] bg-[#161b22] rounded-2xl animate-pulse" />)
            ) : (
              data.trending.map((item: any) => (
                <Link href={`/series/${item._id}`} key={item._id} className="group cursor-pointer space-y-3">
                  <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border border-white/5 bg-[#161b22] shadow-2xl group-hover:shadow-primary/20 transition-all duration-500 group-hover:-translate-y-2">
                    <img 
                      src={item.coverImage}
                      alt={item.title} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    />
                    
                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="size-14 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-[0_0_30px_rgba(139,47,201,0.6)] transform scale-50 group-hover:scale-100 transition-transform duration-300">
                        <Play size={24} fill="currentColor" className="ml-1" />
                      </div>
                    </div>
                    
                    {/* Tag Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white border border-white/10 shadow-lg">
                        {item.tags?.[0] || 'Series'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="px-1">
                    <h3 className="font-bold text-white group-hover:text-primary transition-colors truncate text-lg">{item.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mt-1.5 font-medium">
                      <span className="flex items-center gap-1"><Clock size={12} /> {item.episodeCount || 0} Eps</span>
                      <span className="size-1 rounded-full bg-gray-700" />
                      <span>{item.creator?.displayName || 'Unknown'}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

      </main>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-white/5 bg-[#0b0d11] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-6">
              <Link href="/" className="flex items-center gap-2">
                <div className="p-1.5 bg-primary/10 rounded-lg border border-primary/20">
                  <Zap className="text-primary fill-current" size={20} />
                </div>
                <span className="text-xl font-bold tracking-tight text-white">Micro-Drama</span>
              </Link>
              <p className="text-sm text-gray-500 leading-relaxed">
                The premier destination for vertical storytelling. Experience cinematic quality short-form content designed for the mobile generation.
              </p>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Discover</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link href="/browse" className="hover:text-primary transition-colors">Trending Now</Link></li>
                <li><Link href="/browse" className="hover:text-primary transition-colors">New Releases</Link></li>
                <li><Link href="/browse" className="hover:text-primary transition-colors">Browse Genres</Link></li>
                <li><Link href="/subscription" className="hover:text-primary transition-colors">Premium Plans</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Community</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link href="/register?role=creator" className="hover:text-primary transition-colors">Become a Creator</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Creator Portal</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Help Center</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Legal</h4>
              <ul className="space-y-3 text-sm text-gray-500">
                <li><Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors">Cookie Settings</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600 font-medium">
            <p>© 2025 Micro-Drama Inc. All rights reserved.</p>
            <div className="flex gap-8">
               <a href="#" className="hover:text-white transition-colors">Twitter</a>
               <a href="#" className="hover:text-white transition-colors">Instagram</a>
               <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}