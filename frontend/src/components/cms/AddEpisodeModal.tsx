'use client';

import { useState, useEffect } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import api from '@/lib/api';
import { X, Upload, Loader2, CheckCircle, Image as ImageIcon, Film } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  seriesId: string;
  onClose: () => void;
  onSuccess: () => void;
  nextOrder: number; // Suggest the next episode number
}

export default function AddEpisodeModal({ seriesId, onClose, onSuccess, nextOrder }: Props) {
  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    order: nextOrder.toString(),
    isFree: false,
    seasonId: ''
  });
  const [seasons, setSeasons] = useState<any[]>([]);
  const [duration, setDuration] = useState(0);

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Fetch seasons
  useEffect(() => {
    api.get(`/admin/series/${seriesId}/seasons`).then(res => {
      setSeasons(res.data.data);
      if (res.data.data.length > 0) {
        setFormData(prev => ({ ...prev, seasonId: res.data.data[0]._id }));
      }
    });
  }, [seriesId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!video) return alert('Video file is required');

    setLoading(true);
    setStatus('Uploading Assets...');

    try {
      // 1. Upload Assets
      const videoRes = await uploadToCloudinary(video, 'video');
      const videoUrl = videoRes.url;
      const videoDuration = Math.round(videoRes.duration || 0);

      let thumbnailUrl = '';
      if (thumbnail) {
        const thumbRes = await uploadToCloudinary(thumbnail, 'image');
        thumbnailUrl = thumbRes.url;
      }

      // 2. Save to Backend
      setStatus('Creating Episode...');
      await api.post(`/creator/series/${seriesId}/episodes`, {
        ...formData,
        order: parseInt(formData.order),
        isFree: formData.isFree,
        video: videoUrl,
        thumbnail: thumbnailUrl,
        duration: videoDuration
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to create episode');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-[#1c2128] border border-white/10 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        <div className="flex justify-between items-center p-6 border-b border-white/5">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Film className="text-primary" /> Add Episode {formData.order}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Season</label>
                <select
                  required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  value={formData.seasonId}
                  onChange={e => setFormData({ ...formData, seasonId: e.target.value })}
                >
                  {seasons.map(s => (
                    <option key={s._id} value={s._id} className="bg-zinc-900">Season {s.number}: {s.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Ep Number</label>
                <input
                  type="number" required
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  value={formData.order} onChange={e => setFormData({ ...formData, order: e.target.value })}
                />
              </div>
              <div className="md:col-span-1 space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase">Episode Title</label>
                <input
                  type="text" required placeholder="e.g. The Beginning"
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                  value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase">Synopsis</label>
                <div className="flex items-center gap-2">
                  <span className={clsx("text-[10px] font-bold uppercase", formData.isFree ? "text-emerald-400" : "text-amber-400")}>
                    {formData.isFree ? 'Free Episode' : 'Premium Episode'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isFree: !formData.isFree })}
                    className={clsx(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      formData.isFree ? "bg-emerald-500" : "bg-gray-700"
                    )}
                  >
                    <span className={clsx(
                      "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                      formData.isFree ? "translate-x-4" : "translate-x-0"
                    )} />
                  </button>
                </div>
              </div>
              <textarea
                rows={2} placeholder="What happens in this episode?"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                value={formData.synopsis} onChange={e => setFormData({ ...formData, synopsis: e.target.value })}
              />
            </div>

            {/* Upload Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thumbnail */}
              <div className={clsx("border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors h-32", thumbnail ? "border-emerald-500/50 bg-emerald-500/5" : "border-white/10 hover:border-white/20")}>
                <input type="file" accept="image/*" className="hidden" id="ep-thumb" onChange={e => setThumbnail(e.target.files?.[0] || null)} />
                <label htmlFor="ep-thumb" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  {thumbnail ? <div className="text-emerald-400 text-center"><CheckCircle className="mx-auto mb-1" /> <span className="text-xs truncate block max-w-[150px]">{thumbnail.name}</span></div> : <div className="text-gray-500 text-center"><ImageIcon className="mx-auto mb-1" /> <span className="text-xs">Ep Thumbnail (Optional)</span></div>}
                </label>
              </div>

              {/* Video */}
              <div className={clsx("border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors h-32", video ? "border-purple-500/50 bg-purple-500/5" : "border-white/10 hover:border-white/20")}>
                <input type="file" accept="video/*" className="hidden" id="ep-vid" onChange={e => setVideo(e.target.files?.[0] || null)} />
                <label htmlFor="ep-vid" className="w-full h-full flex flex-col items-center justify-center cursor-pointer">
                  {video ? <div className="text-purple-400 text-center"><CheckCircle className="mx-auto mb-1" /> <span className="text-xs truncate block max-w-[150px]">{video.name}</span></div> : <div className="text-gray-500 text-center"><Film className="mx-auto mb-1" /> <span className="text-xs">Upload Video (Required)</span></div>}
                </label>
              </div>
            </div>

            <button disabled={loading} type="submit" className="w-full py-4 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <><Loader2 className="animate-spin" /> {status}</> : 'Upload Episode'}
            </button>

          </form>
        </div>
      </div>
    </div>
  );
}