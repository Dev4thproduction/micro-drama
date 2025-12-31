'use client';

import { useEffect, useRef, useState } from 'react';
import { 
  Play, 
  Pause, 
  Plus, 
  Minus, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  ChevronUp, 
  ChevronDown,
  Settings,
  Gauge
} from 'lucide-react';
import { clsx } from 'clsx';

interface VideoPlayerProps {
    src: string;
    poster?: string;
    isActive: boolean;
    onEnded?: () => void;
    onTimeUpdate?: (currentTime: number) => void;
}

export default function VideoPlayer({ src, poster, isActive, onEnded, onTimeUpdate }: VideoPlayerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    
    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    // Control State
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [speed, setSpeed] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Menu Visibility State
    const [showVolumeMenu, setShowVolumeMenu] = useState(false);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);

    // --- EFFECT: Handle Active State ---
    useEffect(() => {
        if (!videoRef.current) return;

        if (isActive) {
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch((err) => {
                        console.warn("Autoplay prevented:", err);
                        setIsPlaying(false);
                    });
            }
        } else {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
            setIsPlaying(false);
            setShowVolumeMenu(false); // Close menus on inactive
            setShowSpeedMenu(false);
        }
    }, [isActive]);

    // --- HANDLERS ---

    const togglePlay = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!videoRef.current) return;
        
        // Close menus when playing/pausing via main click
        if (showVolumeMenu) setShowVolumeMenu(false);
        if (showSpeedMenu) setShowSpeedMenu(false);

        if (videoRef.current.paused) {
            videoRef.current.play();
            setIsPlaying(true);
        } else {
            videoRef.current.pause();
            setIsPlaying(false);
        }
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        const curr = videoRef.current.currentTime;
        const dur = videoRef.current.duration || 1;
        
        setCurrentTime(curr);
        setDuration(dur);
        setProgress((curr / dur) * 100);

        if (onTimeUpdate) onTimeUpdate(curr);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
        if (!videoRef.current) return;
        
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percent = Math.max(0, Math.min(1, x / width));
        
        videoRef.current.currentTime = percent * (videoRef.current.duration || 0);
    };

    const adjustVolume = (change: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;

        const newVol = Math.max(0, Math.min(1, volume + change));
        videoRef.current.volume = newVol;
        setVolume(newVol);
        setIsMuted(newVol === 0);
    };

    const adjustSpeed = (change: number, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!videoRef.current) return;

        const newSpeed = Math.max(0.5, Math.min(2.0, speed + change));
        const roundedSpeed = Math.round(newSpeed * 10) / 10;
        
        videoRef.current.playbackRate = roundedSpeed;
        setSpeed(roundedSpeed);
    };

    const toggleFullscreen = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!containerRef.current) return;

        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => console.error(err));
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full bg-black group select-none overflow-hidden"
            onClick={togglePlay}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-cover"
                src={src}
                poster={poster}
                muted={isMuted}
                playsInline
                loop={false}
                onTimeUpdate={handleTimeUpdate}
                onEnded={onEnded}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />

            {/* Play/Pause Center Overlay */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 pointer-events-none">
                    <div className="p-5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 animate-in fade-in zoom-in duration-200">
                        <Play size={40} className="text-white fill-white translate-x-1" />
                    </div>
                </div>
            )}

            {/* --- BOTTOM CONTROLS BAR --- */}
            <div className="absolute bottom-0 inset-x-0 p-4 pb-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent z-30 transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                
                {/* Progress Bar */}
                <div 
                    className="group/progress relative h-1 bg-white/20 rounded-full mb-4 cursor-pointer hover:h-2 transition-all"
                    onClick={handleSeek}
                >
                    <div 
                        className="absolute left-0 top-0 bottom-0 bg-primary rounded-full relative transition-all duration-100 linear"
                        style={{ width: `${progress}%` }}
                    >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 size-3 bg-white rounded-full scale-0 group-hover/progress:scale-100 transition-transform shadow-md" />
                    </div>
                </div>

                {/* Controls Row */}
                <div className="flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        
                        {/* Play/Pause */}
                        <button 
                            onClick={togglePlay}
                            className="text-white hover:text-primary transition-colors p-1" 
                        >
                            {isPlaying ? <Pause size={28} fill="currentColor" /> : <Play size={28} fill="currentColor" />}
                        </button>

                        {/* --- VOLUME POPUP --- */}
                        <div className="relative">
                            {showVolumeMenu && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    <button 
                                        onClick={(e) => adjustVolume(0.1, e)} 
                                        className="size-6 rounded-full hover:bg-white/20 flex items-center justify-center text-white active:scale-95"
                                    >
                                        <Plus size={14} />
                                    </button>
                                    <div className="text-[10px] font-bold w-full text-center">{Math.round(volume * 100)}%</div>
                                    <button 
                                        onClick={(e) => adjustVolume(-0.1, e)} 
                                        className="size-6 rounded-full hover:bg-white/20 flex items-center justify-center text-white active:scale-95"
                                    >
                                        <Minus size={14} />
                                    </button>
                                </div>
                            )}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowVolumeMenu(!showVolumeMenu); setShowSpeedMenu(false); }}
                                className={clsx("p-2 rounded-full hover:bg-white/10 transition-colors", showVolumeMenu && "bg-white/10 text-primary")}
                            >
                                {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>
                        </div>

                        {/* --- SPEED POPUP --- */}
                        <div className="relative">
                            {showSpeedMenu && (
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-black/60 backdrop-blur-md border border-white/10 rounded-full p-1.5 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                                    <button 
                                        onClick={(e) => adjustSpeed(0.25, e)} 
                                        className="size-6 rounded-full hover:bg-white/20 flex items-center justify-center text-white active:scale-95"
                                    >
                                        <ChevronUp size={16} />
                                    </button>
                                    <div className="text-[10px] font-bold font-mono text-center">{speed}x</div>
                                    <button 
                                        onClick={(e) => adjustSpeed(-0.25, e)} 
                                        className="size-6 rounded-full hover:bg-white/20 flex items-center justify-center text-white active:scale-95"
                                    >
                                        <ChevronDown size={16} />
                                    </button>
                                </div>
                            )}
                            <button 
                                onClick={(e) => { e.stopPropagation(); setShowSpeedMenu(!showSpeedMenu); setShowVolumeMenu(false); }}
                                className={clsx("p-2 rounded-full hover:bg-white/10 transition-colors", showSpeedMenu && "bg-white/10 text-primary")}
                            >
                                <Gauge size={20} />
                            </button>
                        </div>

                        {/* Time */}
                        <span className="text-xs font-medium tracking-wide font-mono opacity-80 select-none ml-2">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button 
                            onClick={toggleFullscreen}
                            className="p-2 text-white hover:text-primary transition-colors hover:bg-white/10 rounded-full" 
                        >
                            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}