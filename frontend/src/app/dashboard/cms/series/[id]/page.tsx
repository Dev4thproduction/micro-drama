'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import {
    ArrowLeft, Check, Clock, Film, Loader2, Pencil, Plus, RefreshCw, Trash2, Upload, X, Image as ImageIcon
} from 'lucide-react';
import api from '@/lib/api';
import { uploadToCloudinary } from '@/lib/cloudinary'; 

// --- Type Definitions ---
type Series = {
    _id: string;
    title: string;
    status: string;
    category?: { name: string; color: string };
};

type Episode = {
    _id: string;
    title: string;
    synopsis: string;
    order: number;
    status: string;
    isFree?: boolean;
    videoUrl: string;
    videoPublicId?: string;
    thumbnailUrl: string;
    duration: number;
    season?: string;
    createdAt: string;
    updatedAt?: string;
};

type Season = {
    _id: string;
    number: number;
    title: string;
    description?: string;
    status: string;
};

// --- Config ---
const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
    pending: { label: 'Pending', class: 'border-amber-500/30 bg-amber-500/10 text-amber-200' },
    draft: { label: 'Draft', class: 'border-gray-500/30 bg-gray-500/10 text-gray-200' },
    scheduled: { label: 'Scheduled', class: 'border-blue-500/30 bg-blue-500/10 text-blue-200' },
    published: { label: 'Published', class: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200' },
    archived: { label: 'Archived', class: 'border-red-500/30 bg-red-500/10 text-red-200' },
};

export default function SeriesDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const seriesId = params.id as string;

    const [series, setSeries] = useState<Series | null>(null);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal States
    const [showAddModal, setShowAddModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);

    // Episode Form State
    const [formTitle, setFormTitle] = useState('');
    const [formSynopsis, setFormSynopsis] = useState('');
    const [formOrder, setFormOrder] = useState(1);
    const [formSeasonId, setFormSeasonId] = useState<string | null>(null);
    const [formIsFree, setFormIsFree] = useState(false);
    const [formVideoUrl, setFormVideoUrl] = useState('');
    const [formThumbnailUrl, setFormThumbnailUrl] = useState('');
    const [formDuration, setFormDuration] = useState(0);
    
    // Upload States
    const [videoUploading, setVideoUploading] = useState(false);
    const [thumbnailUploading, setThumbnailUploading] = useState(false);

    // Refs for hidden inputs
    const videoInputRef = useRef<HTMLInputElement>(null);
    const thumbnailInputRef = useRef<HTMLInputElement>(null);

    const fetchData = useCallback(async () => {
        if (!seriesId) return;
        setLoading(true);
        setError('');
        try {
            const [episodesRes, seriesRes] = await Promise.all([
                api.get(`/admin/series/${seriesId}/episodes`),
                api.get('/admin/series')
            ]);

            const episodesPayload = episodesRes.data?.data ?? episodesRes.data;
            const items = Array.isArray(episodesPayload) ? episodesPayload : (episodesPayload?.items ?? []);
            setEpisodes(items);

            const seriesData = seriesRes.data?.data ?? seriesRes.data;
            const seriesList = Array.isArray(seriesData) ? seriesData : (seriesData?.items ?? []);
            const found = seriesList.find((s: any) => s._id === seriesId);
            if (found) setSeries(found);
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.error?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [seriesId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // --- Handle Video Upload ---
    const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setVideoUploading(true);
        try {
            const result = await uploadToCloudinary(file, 'video');
            setFormVideoUrl(result.url);
            setFormDuration(Math.round(result.duration));
            
            // Only auto-set thumbnail if one isn't already set
            if (!formThumbnailUrl) {
                const thumb = result.url.replace(/\.[^/.]+$/, ".jpg")
                                        .replace('/upload/', '/upload/c_fill,w_300,h_170/');
                setFormThumbnailUrl(thumb);
            }
        } catch (err) {
            console.error(err);
            alert('Failed to upload video');
        } finally {
            setVideoUploading(false);
            if (videoInputRef.current) videoInputRef.current.value = '';
        }
    };

    // --- Handle Thumbnail Upload ---
    const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setThumbnailUploading(true);
        try {
            const result = await uploadToCloudinary(file, 'image');
            setFormThumbnailUrl(result.url);
        } catch (err) {
            console.error(err);
            alert('Failed to upload thumbnail');
        } finally {
            setThumbnailUploading(false);
            if (thumbnailInputRef.current) thumbnailInputRef.current.value = '';
        }
    };

    const resetForm = () => {
        setEditingEpisode(null);
        setFormTitle('');
        setFormSynopsis('');
        setFormOrder(episodes.length + 1);
        setFormSeasonId(null);
        setFormIsFree(false);
        setFormVideoUrl('');
        setFormThumbnailUrl('');
        setFormDuration(0);
    };

    const handleEdit = (episode: Episode) => {
        setEditingEpisode(episode);
        setFormTitle(episode.title);
        setFormSynopsis(episode.synopsis || '');
        setFormOrder(episode.order);
        setFormSeasonId(episode.season || null);
        setFormIsFree(episode.isFree || false);
        setFormVideoUrl(episode.videoUrl);
        setFormThumbnailUrl(episode.thumbnailUrl);
        setFormDuration(episode.duration);
        setShowAddModal(true);
    };

    const handleDelete = async (episodeId: string) => {
        if (!confirm('Are you sure you want to delete this episode?')) return;
        
        setDeletingId(episodeId);
        try {
            await api.delete(`/admin/episodes/${episodeId}`);
            setEpisodes(prev => prev.filter(ep => ep._id !== episodeId));
        } catch (err: any) {
            setError('Failed to delete episode');
        } finally {
            setDeletingId(null);
        }
    };

    const handleSaveEpisode = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formTitle.trim() || !formVideoUrl) {
            setError('Title and Video are required');
            return;
        }

        setSaving(true);
        try {
            const payload = {
                title: formTitle.trim(),
                synopsis: formSynopsis.trim(),
                order: formOrder,
                seasonId: formSeasonId,
                isFree: formIsFree,
                videoUrl: formVideoUrl,
                thumbnailUrl: formThumbnailUrl,
                duration: formDuration
            };

            if (editingEpisode) {
                const res = await api.patch(`/admin/episodes/${editingEpisode._id}`, payload);
                const updated = res.data?.data ?? res.data;
                setEpisodes(prev => prev.map(ep => ep._id === updated._id ? updated : ep).sort((a, b) => a.order - b.order));
            } else {
                const res = await api.post(`/admin/series/${seriesId}/episodes`, payload);
                const newEp = res.data?.data ?? res.data;
                setEpisodes(prev => [...prev, newEp].sort((a, b) => a.order - b.order));
            }
            setShowAddModal(false);
            resetForm();
        } catch (err: any) {
            setError(err?.response?.data?.error?.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    const handlePublish = async (episodeId: string) => {
        try {
            await api.patch(`/admin/episodes/${episodeId}`, { status: 'published' });
            setEpisodes(prev => prev.map(ep => ep._id === episodeId ? { ...ep, status: 'published' } : ep));
        } catch (err) {
            setError('Failed to publish');
        }
    };

    const formatDuration = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="space-y-6 p-6">
            {/* --- Header --- */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={16} /> Back
                    </button>
                    <h1 className="text-2xl font-bold text-white">{series?.title || 'Loading...'}</h1>
                    <p className="text-sm text-gray-400">{episodes.length} Episodes</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={fetchData} disabled={loading} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white transition">
                        <RefreshCw size={20} className={clsx(loading && 'animate-spin')} />
                    </button>
                    <button 
                        onClick={() => { resetForm(); setShowAddModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition"
                    >
                        <Plus size={20} /> Add Episode
                    </button>
                </div>
            </div>

            {/* --- Error Alert --- */}
            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 flex justify-between">
                    <span>{error}</span>
                    <button onClick={() => setError('')}><X size={16} /></button>
                </div>
            )}

            {/* --- Episode List --- */}
            <div className="space-y-4">
                {episodes.map((episode) => {
                    const status = STATUS_CONFIG[episode.status] || STATUS_CONFIG.draft;
                    return (
                        <div key={episode._id} className="p-4 rounded-2xl bg-[#161b22] border border-white/5 hover:border-white/10 transition flex gap-4">
                            {/* Thumbnail */}
                            <div className="relative w-32 h-20 bg-black/50 rounded-lg overflow-hidden flex-shrink-0">
                                {episode.thumbnailUrl ? (
                                    <img src={episode.thumbnailUrl} className="w-full h-full object-cover" alt={episode.title} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-600"><Film size={24} /></div>
                                )}
                                <div className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/80 text-[10px] text-white rounded">
                                    {formatDuration(episode.duration)}
                                </div>
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-white truncate">
                                            <span className="text-gray-500 mr-2">#{episode.order}</span>
                                            {episode.title}
                                        </h3>
                                        <div className="flex gap-2">
                                            <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', episode.isFree ? 'border-emerald-500/30 text-emerald-400' : 'border-amber-500/30 text-amber-400')}>
                                                {episode.isFree ? 'FREE' : 'PREMIUM'}
                                            </span>
                                            <span className={clsx('text-[10px] px-2 py-0.5 rounded-full border', status.class)}>
                                                {status.label}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-400 truncate mt-1">{episode.synopsis}</p>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 mt-2">
                                    {episode.status !== 'published' && (
                                        <button onClick={() => handlePublish(episode._id)} className="text-xs flex items-center gap-1 text-emerald-400 hover:text-emerald-300">
                                            <Check size={14} /> Publish
                                        </button>
                                    )}
                                    <button onClick={() => handleEdit(episode)} className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300">
                                        <Pencil size={14} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(episode._id)} disabled={deletingId === episode._id} className="text-xs flex items-center gap-1 text-red-400 hover:text-red-300 disabled:opacity-50">
                                        {deletingId === episode._id ? <Loader2 size={14} className="animate-spin"/> : <Trash2 size={14} />} Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {episodes.length === 0 && !loading && (
                    <div className="text-center py-12 text-gray-500 bg-[#161b22] rounded-2xl border border-white/5">
                        No episodes found.
                    </div>
                )}
            </div>

            {/* --- Add/Edit Modal --- */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#0d1117] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">{editingEpisode ? 'Edit Episode' : 'New Episode'}</h2>
                            <button onClick={() => setShowAddModal(false)}><X className="text-gray-400 hover:text-white" /></button>
                        </div>
                        <form onSubmit={handleSaveEpisode} className="space-y-4">
                            
                            {/* --- Video Upload --- */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Video File *</label>
                                <input 
                                    type="file" 
                                    ref={videoInputRef}
                                    accept="video/mp4,video/webm,video/mov"
                                    className="hidden"
                                    onChange={handleVideoUpload}
                                />
                                {!formVideoUrl ? (
                                    <div 
                                        onClick={() => !videoUploading && videoInputRef.current?.click()}
                                        className={clsx(
                                            "border-2 border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition",
                                            videoUploading && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {videoUploading ? (
                                            <>
                                                <Loader2 className="animate-spin text-primary mb-2" />
                                                <span className="text-sm text-gray-400">Uploading Video...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="text-gray-400 mb-2" />
                                                <span className="text-sm text-gray-400">Click to upload video</span>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                        <Check size={18} className="text-emerald-400" />
                                        <div className="flex-1 overflow-hidden">
                                            <p className="text-sm text-emerald-200 truncate">Video Uploaded</p>
                                            <p className="text-xs text-emerald-400/70">Duration: {formDuration}s</p>
                                        </div>
                                        <button type="button" onClick={() => { setFormVideoUrl(''); setFormDuration(0); }} className="text-gray-400 hover:text-white"><X size={16}/></button>
                                    </div>
                                )}
                            </div>

                            {/* --- Thumbnail Upload (NEW) --- */}
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-400 mb-2">Thumbnail (Optional)</label>
                                <input 
                                    type="file" 
                                    ref={thumbnailInputRef}
                                    accept="image/png,image/jpeg,image/jpg,image/webp"
                                    className="hidden"
                                    onChange={handleThumbnailUpload}
                                />
                                
                                {!formThumbnailUrl ? (
                                    <div 
                                        onClick={() => !thumbnailUploading && thumbnailInputRef.current?.click()}
                                        className={clsx(
                                            "border-2 border-dashed border-white/10 rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition h-24",
                                            thumbnailUploading && "opacity-50 cursor-not-allowed"
                                        )}
                                    >
                                        {thumbnailUploading ? (
                                            <Loader2 className="animate-spin text-primary" />
                                        ) : (
                                            <div className="flex items-center gap-2 text-gray-400">
                                                <ImageIcon size={20} />
                                                <span className="text-xs">Upload Thumbnail</span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="relative w-full h-40 bg-black/50 rounded-xl overflow-hidden group border border-white/10">
                                        <img src={formThumbnailUrl} className="w-full h-full object-cover" alt="Thumbnail" />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                type="button"
                                                onClick={() => setFormThumbnailUrl('')}
                                                className="p-2 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500/40"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <input 
                                placeholder="Episode Title" 
                                value={formTitle} 
                                onChange={e => setFormTitle(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                                <input 
                                    type="number" 
                                    placeholder="Order" 
                                    value={formOrder} 
                                    onChange={e => setFormOrder(Number(e.target.value))}
                                    className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
                                />
                                <button 
                                    type="button"
                                    onClick={() => setFormIsFree(!formIsFree)}
                                    className={clsx("rounded-xl border px-4 py-3 text-sm font-semibold transition", formIsFree ? "bg-emerald-500/20 border-emerald-500 text-emerald-400" : "bg-white/5 border-white/10 text-gray-400")}
                                >
                                    {formIsFree ? 'Free for Everyone' : 'Premium Only'}
                                </button>
                            </div>

                            <textarea 
                                placeholder="Synopsis" 
                                rows={3}
                                value={formSynopsis}
                                onChange={e => setFormSynopsis(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary resize-none"
                            />

                            <button 
                                disabled={saving || videoUploading || thumbnailUploading} 
                                className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-xl shadow-lg shadow-primary/25 disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {saving && <Loader2 className="animate-spin" size={18} />}
                                {editingEpisode ? 'Save Changes' : 'Create Episode'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}