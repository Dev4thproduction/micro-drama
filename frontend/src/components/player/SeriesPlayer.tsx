'use client';

import { useEffect, useState } from 'react';
import VideoPlayer from '@/components/player/VideoPlayer';
import { 
  Loader2, ChevronLeft, ChevronRight, Play, Clock, Eye, Plus, 
  Share2, ThumbsUp, MoreHorizontal, Sparkles, Lock, Crown
} from 'lucide-react';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { clsx } from 'clsx';

interface Episode {
    _id: string;
    title: string;
    synopsis: string;
    order: number;
    video: string;      
    thumbnail: string;  
    duration?: number; 
    isLocked?: boolean; // ✅ Added lock flag
}

interface SeriesPlayerProps {
    episodeId: string; 
}

export default function SeriesPlayer({ episodeId }: SeriesPlayerProps) {
    const router = useRouter();
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [seriesInfo, setSeriesInfo] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    
    // Player State
    const [activeIndex, setActiveIndex] = useState(0);
    const activeEpisode = episodes[activeIndex];

    useEffect(() => {
        const initPlayer = async () => {
            try {
                setLoading(true);

                // STEP 1: Fetch the specific episode to Play & get the series ID
                const epRes = await api.get(`/content/episodes/${episodeId}`);
                const currentEpData = epRes.data.data || epRes.data;
                
                // Extract Series ID (handles both populated object or string ID)
                const fetchedSeriesId = currentEpData.series._id || currentEpData.series;

                // STEP 2: Fetch the full series playlist
                const listRes = await api.get(`/content/series/${fetchedSeriesId}`);
                
                const { series, episodes: epList } = listRes.data.data ?? listRes.data;

                setSeriesInfo(series);
                setEpisodes(epList || []);

                // STEP 3: Set the player to the correct episode
                const startingIndex = epList.findIndex((e: any) => e._id === episodeId);
                if (startingIndex !== -1) {
                    setActiveIndex(startingIndex);
                }

            } catch (err) {
                console.error("Failed to load player data", err);
            } finally {
                setLoading(false);
            }
        };

        if (episodeId) initPlayer();
    }, [episodeId]);

    // Handle Video End (Auto-play next)
    const handleVideoEnded = () => {
        if (activeIndex < episodes.length - 1) {
            const nextEp = episodes[activeIndex + 1];
            // ✅ Prevent auto-play if next episode is locked
            if (!nextEp.isLocked) {
                changeEpisode(activeIndex + 1);
            }
        }
    };

    // Helper to change episode
    const changeEpisode = (index: number) => {
        if (index >= 0 && index < episodes.length) {
            const targetEp = episodes[index];
            
            // ✅ Enforce Lock on Frontend
            if (targetEp.isLocked) {
                router.push('/subscription');
                return;
            }

            setActiveIndex(index);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#050505] flex items-center justify-center text-white">
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/50 blur-xl rounded-full animate-pulse" />
                        <Loader2 className="animate-spin text-primary relative z-10" size={48} />
                    </div>
                    <span className="text-gray-400 text-sm tracking-widest uppercase animate-pulse">Loading Experience...</span>
                </div>
            </div>
        );
    }

    if (!seriesInfo || episodes.length === 0) {
        return (
            <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-white gap-6">
               <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center max-w-md">
                   <h2 className="text-xl font-bold text-red-400 mb-2">Content Unavailable</h2>
                   <p className="text-gray-400 mb-6">We couldn't load the requested series. It might have been removed or is currently inaccessible.</p>
                   <button 
                        onClick={() => router.back()} 
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 rounded-full font-medium transition-all"
                    >
                        Go Back
                   </button>
               </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col lg:flex-row h-screen w-full bg-[#030014] text-gray-100 overflow-hidden font-sans selection:bg-primary/30">
            
            {/* --- BACKGROUND EFFECTS --- */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[150px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[150px]" />
            </div>

            {/* --- TOP MOBILE NAV --- */}
            <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-black/40 backdrop-blur-xl border-b border-white/10 z-50 sticky top-0">
                <Link href="/" className="flex items-center gap-2 text-white hover:text-primary transition-colors">
                    <ChevronLeft size={24} />
                    <span className="font-bold tracking-tight">Back</span>
                </Link>
                <span className="text-sm font-semibold truncate max-w-[150px]">{seriesInfo.title}</span>
            </header>

            {/* --- MAIN LAYOUT --- */}
            <main className="flex-1 flex flex-col lg:flex-row relative z-10 overflow-hidden">
                
                {/* --- LEFT: PLAYER AREA --- */}
                <div className="flex-1 flex items-center justify-center p-4 lg:p-8 relative group/player overflow-hidden">
                    
                    {/* Glowing Container for Video */}
                    <div className="relative aspect-[9/16] h-full max-h-[85vh] w-auto shadow-2xl z-20">
                        {/* Animated Glow Behind Player */}
                        <div className="absolute -inset-1 bg-gradient-to-tr from-primary/30 to-blue-600/30 rounded-2xl blur opacity-50 group-hover/player:opacity-80 transition duration-1000" />
                        
                        <div className="relative w-full h-full rounded-xl overflow-hidden bg-black ring-1 ring-white/10 shadow-inner">
                            {activeEpisode && (
                                activeEpisode.isLocked ? (
                                    // ✅ Locked State Overlay
                                    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm text-center p-6">
                                        <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-6 ring-1 ring-white/20">
                                            <Lock size={32} className="text-white/70" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-white mb-2">Premium Episode</h3>
                                        <p className="text-gray-400 mb-8 max-w-xs">
                                            Subscribe to our plan to unlock this episode and continue watching.
                                        </p>
                                        <button 
                                            onClick={() => router.push('/subscription')}
                                            className="px-8 py-3 bg-gradient-to-r from-primary to-purple-600 hover:shadow-lg hover:shadow-primary/25 text-white font-bold rounded-xl transition-all flex items-center gap-2"
                                        >
                                            <Crown size={20} fill="currentColor" />
                                            Unlock Now
                                        </button>
                                    </div>
                                ) : (
                                    // Active Player
                                    <VideoPlayer
                                        key={activeEpisode._id}
                                        src={activeEpisode.video}
                                        poster={activeEpisode.thumbnail}
                                        isActive={true}
                                        onEnded={handleVideoEnded}
                                    />
                                )
                            )}
                            
                            {/* Overlay Title (Desktop) */}
                            {!activeEpisode?.isLocked && (
                                <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-start opacity-0 group-hover/player:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-black/80 to-transparent pointer-events-none">
                                    <div className="transform translate-y-[-10px] group-hover/player:translate-y-0 transition-transform duration-500">
                                        <h3 className="text-white text-xl font-bold drop-shadow-lg tracking-tight">
                                            Ep. {activeEpisode?.order} <span className="text-white/60 mx-1">|</span> {activeEpisode?.title}
                                        </h3>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* --- RIGHT: FUTURISTIC SIDEBAR --- */}
                <aside className="w-full lg:w-[450px] xl:w-[500px] shrink-0 h-full flex flex-col bg-black/40 backdrop-blur-2xl border-l border-white/5 relative shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
                    
                    {/* Header Section */}
                    <div className="p-6 lg:p-8 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
                        <div className="flex items-center gap-3 mb-4">
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-primary text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                                {seriesInfo.category || 'Series'}
                            </span>
                            <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-white/10 text-gray-300 border border-white/5">
                                {episodes.length} Episodes
                            </span>
                        </div>

                        <h1 className="text-3xl font-bold text-white mb-2 leading-tight tracking-tight">
                            {seriesInfo.title}
                        </h1>

                        <div className="flex items-center gap-6 text-sm text-gray-400 mt-3">
                            <div className="flex items-center gap-1.5">
                                <Eye size={16} className="text-blue-400" />
                                <span>1.2M</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Sparkles size={16} className="text-yellow-400" />
                                <span>98% Match</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Clock size={16} />
                                <span>2024</span>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 mt-6">
                            <button onClick={() => router.push('/subscription')} className="flex-1 py-2.5 bg-white text-black font-bold rounded-lg hover:bg-gray-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                                <Plus size={18} />
                                Subscribe
                            </button>
                            <button className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all">
                                <ThumbsUp size={18} />
                            </button>
                            <button className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-all">
                                <Share2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Episode List Header */}
                    <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-black/20">
                        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                            <MoreHorizontal size={16} /> Playlist
                        </h3>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => changeEpisode(activeIndex - 1)}
                                disabled={activeIndex === 0}
                                className="p-1.5 rounded bg-white/5 hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button 
                                onClick={() => changeEpisode(activeIndex + 1)}
                                disabled={activeIndex === episodes.length - 1}
                                className="p-1.5 rounded bg-white/5 hover:bg-primary hover:text-white disabled:opacity-30 disabled:hover:bg-white/5 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Scrollable List */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
                        {episodes.map((ep, idx) => {
                            const isActive = activeIndex === idx;
                            return (
                                <div 
                                    key={ep._id}
                                    onClick={() => changeEpisode(idx)}
                                    className={clsx(
                                        "group flex gap-4 p-2.5 rounded-xl transition-all duration-300 cursor-pointer border relative overflow-hidden",
                                        isActive 
                                            ? "bg-white/5 border-primary/50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]" 
                                            : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/5",
                                        ep.isLocked && "opacity-75"
                                    )}
                                >
                                    {/* Active Indicator Glow */}
                                    {isActive && <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />}

                                    {/* Thumbnail */}
                                    <div className="relative w-20 aspect-[9/16] rounded-lg bg-gray-900 overflow-hidden shrink-0 border border-white/5">
                                        <img 
                                            src={ep.thumbnail} 
                                            alt={ep.title}
                                            className={clsx(
                                                "w-full h-full object-cover transition-transform duration-700",
                                                isActive ? "scale-110" : "scale-100 group-hover:scale-105 opacity-70 group-hover:opacity-100",
                                                ep.isLocked && "grayscale"
                                            )}
                                        />
                                        <div className={clsx(
                                            "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity",
                                            isActive || ep.isLocked ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                                        )}>
                                            {ep.isLocked ? (
                                                <Lock size={16} className="text-white drop-shadow-md" />
                                            ) : (
                                                <Play size={16} fill="white" className="text-white drop-shadow-md" />
                                            )}
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex flex-col justify-center gap-1 flex-1 min-w-0 z-10">
                                        <div className="flex justify-between items-center">
                                            <span className={clsx(
                                                "text-[10px] font-bold uppercase tracking-wider",
                                                isActive ? "text-primary drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]" : "text-gray-500"
                                            )}>
                                                Episode {ep.order}
                                            </span>
                                            {isActive && !ep.isLocked && <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_#8B5CF6]" />}
                                            {ep.isLocked && <div className="p-0.5 rounded bg-amber-500/10 border border-amber-500/20"><Lock size={10} className="text-amber-500" /></div>}
                                        </div>
                                        
                                        <h4 className={clsx(
                                            "text-sm font-semibold line-clamp-2 leading-snug transition-colors",
                                            isActive ? "text-white" : "text-gray-300 group-hover:text-white"
                                        )}>
                                            {ep.title}
                                        </h4>
                                        
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                                <Clock size={10} /> 2m 45s
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        
                        {/* Bottom Spacer */}
                        <div className="h-10" />
                    </div>
                </aside>
            </main>
        </div>
    );
}