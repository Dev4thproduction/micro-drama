'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Layers } from 'lucide-react';
import api from '@/lib/api';
import { clsx } from 'clsx';

interface Season {
    _id: string;
    number: number;
    title: string;
    description?: string;
    status: string;
}

interface Props {
    seriesId: string;
    season?: Season | null; // If provided, it's Edit mode
    onClose: () => void;
    onSuccess: () => void;
    nextSeasonNumber?: number;
}

export default function SeasonModal({ seriesId, season, onClose, onSuccess, nextSeasonNumber = 1 }: Props) {
    const [formData, setFormData] = useState({
        title: season?.title || `Season ${nextSeasonNumber}`,
        number: season?.number || nextSeasonNumber,
        description: season?.description || '',
        status: (season?.status || 'draft') as 'draft' | 'published' | 'archived'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isEdit = !!season;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim()) {
            setError('Season title is required');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (isEdit) {
                await api.patch(`/admin/seasons/${season._id}`, formData);
            } else {
                await api.post(`/admin/series/${seriesId}/seasons`, formData);
            }

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err?.response?.data?.error?.message || `Failed to ${isEdit ? 'update' : 'create'} season`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-[#161b22] border border-white/10 w-full max-w-md rounded-2xl shadow-2xl">

                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0f1117]">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-xl bg-purple-500/20 text-purple-400">
                            <Layers size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">{isEdit ? 'Edit Season' : 'Add New Season'}</h2>
                            <p className="text-xs text-gray-400">{isEdit ? 'Update season details' : 'Create a new season for this series'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Error Alert */}
                        {error && (
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm flex justify-between items-center">
                                <span>{error}</span>
                                <button type="button" onClick={() => setError('')}>
                                    <X size={16} />
                                </button>
                            </div>
                        )}

                        {/* Season Number */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-300 ml-1">Season Number</label>
                            <input
                                type="number"
                                min="1"
                                required
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                value={formData.number}
                                onChange={e => setFormData({ ...formData, number: parseInt(e.target.value) || 1 })}
                            />
                        </div>

                        {/* Season Title */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-300 ml-1">Season Title</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g., Season 1, The Beginning Arc"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-300 ml-1">Description (Optional)</label>
                            <textarea
                                rows={3}
                                placeholder="What happens in this season?"
                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all resize-none"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* Status */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-300 ml-1">Status</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['draft', 'published', 'archived'] as const).map(status => (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, status })}
                                        className={clsx(
                                            "px-4 py-2.5 rounded-xl border text-xs font-bold uppercase transition-all",
                                            formData.status === status
                                                ? status === 'published'
                                                    ? "bg-emerald-500/20 border-emerald-500 text-emerald-400"
                                                    : status === 'draft'
                                                        ? "bg-gray-500/20 border-gray-500 text-gray-300"
                                                        : "bg-red-500/20 border-red-500 text-red-400"
                                                : "bg-white/5 border-white/10 text-gray-400 hover:bg-white/10"
                                        )}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        {isEdit ? 'Updating...' : 'Creating...'}
                                    </>
                                ) : (
                                    isEdit ? 'Save Changes' : 'Create Season'
                                )}
                            </button>
                        </div>

                    </form>
                </div>

            </div>
        </div>
    );
}
