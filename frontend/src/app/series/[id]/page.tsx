'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import {
  Play,
  Plus,
  Check,
  Share2,
  Lock,
  Loader2,
  ChevronLeft,
  Crown
} from 'lucide-react';
import { clsx } from 'clsx';

export default function SeriesDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isInList, setIsInList] = useState(false);
  const [togglingList, setTogglingList] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // The backend automatically checks the user's token and subscription
        // to determine which episodes should have `isLocked: true`
        const res = await api.get(`/content/series/${id}`);
        setData(res.data.data);

        // Check if in my list
        const listRes = await api.get(`/users/mylist/check/${id}`).catch(() => null);
        if (listRes) setIsInList(listRes.data.isInList);
      } catch (err: any) {
        console.error("Fetch Error:", err);
        setError(err.response?.data?.message || 'Series not found.');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <Loader2 className="animate-spin text-[#8B5CF6]" size={40} />
      </div>
    );
  }

  if (error || !data || !data.series) {
    return (
      <div className="min-h-screen bg-[#000000] flex flex-col items-center justify-center text-white gap-4">
        <h2 className="text-xl font-bold text-red-400">Error</h2>
        <p className="text-gray-400">{error || 'Series data unavailable'}</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-white/10 rounded-full hover:bg-white/20">
          Go Back
        </button>
      </div>
    );
  }

  const { series, episodes = [] } = data;

  const toggleMyList = async () => {
    try {
      setTogglingList(true);
      if (isInList) {
        await api.delete(`/users/mylist/${id}`);
        setIsInList(false);
      } else {
        await api.post(`/users/mylist/${id}`);
        setIsInList(true);
      }
    } catch (err) {
      console.error("Toggle List Error:", err);
    } finally {
      setTogglingList(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] text-gray-100 font-sans pb-24 transition-colors duration-300">

      {/* --- NAVBAR OVERLAY --- */}
      <nav className="w-full px-6 py-4 flex items-center justify-between absolute top-0 z-20">
        <div
          onClick={() => router.back()}
          className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
        >
          <button className="p-2 rounded-full bg-black/20 hover:bg-white/10 text-white backdrop-blur-sm">
            <ChevronLeft size={24} />
          </button>
          <span className="text-xl font-bold tracking-tight text-white hidden md:block">Back</span>
        </div>
      </nav>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-24">

        {/* --- HERO SECTION --- */}
        <section className="flex flex-col-reverse lg:flex-row gap-12 items-center lg:items-start mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">

          {/* Left: Text Content */}
          <div className="flex-1 flex flex-col justify-center space-y-6 text-center lg:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
              {series.title}
            </h1>

            {/* Metadata Tags */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 text-sm md:text-base text-gray-300">
              <span className="border border-gray-500 px-1.5 py-0.5 rounded text-xs font-semibold">13+</span>
              <span>•</span>
              <span>{episodes.length > 0 ? '1 Season' : 'Coming Soon'}</span>
              <span>•</span>
              <span>{series.category || 'Drama'}</span>
              <span>•</span>
              <span>{new Date(series.createdAt).getFullYear()}</span>
            </div>

            {/* Description */}
            <p className="text-gray-400 max-w-2xl text-base md:text-lg leading-relaxed mx-auto lg:mx-0">
              {series.description || "No description available."}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
              {episodes.length > 0 ? (
                <button
                  onClick={() => router.push(`/watch/${episodes[0]._id}`)}
                  className="bg-[#8B5CF6] hover:bg-violet-700 text-white px-8 py-3.5 rounded-lg flex items-center gap-2 font-semibold transition-transform active:scale-95 shadow-lg shadow-violet-500/30"
                >
                  <Play size={20} fill="currentColor" />
                  Watch Now
                </button>
              ) : (
                <button disabled className="bg-gray-800 text-gray-500 px-8 py-3.5 rounded-lg font-semibold cursor-not-allowed">
                  Coming Soon
                </button>
              )}

              <button
                aria-label={isInList ? "Remove from list" : "Add to list"}
                onClick={toggleMyList}
                disabled={togglingList}
                className={clsx(
                  "p-3.5 rounded-lg transition-colors flex items-center justify-center",
                  isInList ? "bg-[#8B5CF6]/20 text-[#8B5CF6] hover:bg-[#8B5CF6]/30" : "bg-[#27272a] hover:bg-gray-700 text-white"
                )}
              >
                {togglingList ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : isInList ? (
                  <Check size={20} />
                ) : (
                  <Plus size={20} />
                )}
              </button>
              <button aria-label="Share" className="bg-[#27272a] hover:bg-gray-700 text-white p-3.5 rounded-lg transition-colors">
                <Share2 size={20} />
              </button>
            </div>
          </div>

          {/* Right: Poster with Glow Effect */}
          <div className="w-full max-w-[320px] lg:max-w-[400px] flex-shrink-0 relative group">
            {/* The Gradient Blur Behind */}
            <div className="absolute -inset-1 bg-gradient-to-r from-[#8B5CF6] to-pink-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />

            <img
              src={series.coverImage}
              alt={series.title}
              className="relative w-full h-auto rounded-xl shadow-2xl object-cover aspect-[2/3] border border-white/5 bg-[#1A1A1A]"
            />
          </div>
        </section>

        {/* --- EPISODES GRID --- */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6 pl-1">{episodes.length} Episodes</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {episodes.map((ep: any) => {
              // ✅ FIXED: Use the backend's `isLocked` property directly
              const isLocked = ep.isLocked;

              return (
                <div
                  key={ep._id}
                  onClick={() => {
                    if (isLocked) {
                      // ✅ Redirect to subscription if locked
                      router.push('/subscription');
                    } else {
                      // ✅ Play if unlocked
                      router.push(`/watch/${ep._id}`);
                    }
                  }}
                  className={clsx(
                    "group bg-[#1A1A1A] rounded-lg overflow-hidden flex h-40 cursor-pointer transition-all",
                    isLocked
                      ? "opacity-90 hover:opacity-100 hover:ring-2 hover:ring-gray-700"
                      : "hover:ring-2 hover:ring-[#8B5CF6]"
                  )}
                >
                  {/* Thumbnail Section (40%) */}
                  <div className="w-[40%] h-full relative overflow-hidden bg-black">
                    <img
                      src={ep.thumbnail || ep.video}
                      alt={`Episode ${ep.order}`}
                      className={clsx(
                        "w-full h-full object-cover transition-transform duration-500 group-hover:scale-110",
                        isLocked ? "grayscale opacity-60" : "opacity-80 group-hover:opacity-100"
                      )}
                    />

                    {/* Locked Overlay */}
                    {isLocked && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Lock size={24} className="text-white drop-shadow-lg" />
                      </div>
                    )}
                  </div>

                  {/* Info Section (60%) */}
                  <div className="w-[60%] p-4 flex flex-col justify-between">
                    <h3 className="text-sm font-semibold text-gray-100 leading-snug line-clamp-2">
                      {ep.title}
                    </h3>

                    <div className="flex items-end justify-between">
                      <span className="text-xs font-bold text-gray-400 tracking-widest mb-1">
                        EP. {ep.order}
                      </span>

                      {/* Status Icon */}
                      <div className={clsx(
                        "w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors",
                        isLocked
                          ? "bg-gray-800 text-white/50"
                          : "bg-white text-black"
                      )}>
                        {isLocked ? (
                          <Crown size={14} className="text-yellow-500" />
                        ) : (
                          <Play size={18} fill="currentColor" className="ml-0.5" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {episodes.length === 0 && !loading && (
            <div className="w-full py-12 text-center text-gray-500 border border-dashed border-gray-800 rounded-xl">
              No episodes uploaded yet.
            </div>
          )}
        </section>

      </main>
    </div>
  );
}