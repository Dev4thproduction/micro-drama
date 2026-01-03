'use client';

import { useState, useEffect } from 'react';
import { uploadToCloudinary } from '@/lib/cloudinary';
import api from '@/lib/api';
import { X, Upload, Loader2, CheckCircle, Image as ImageIcon, Film, Layers, PlayCircle, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface Props {
  type: 'movie' | 'series';
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateContentModal({ type, onClose, onSuccess }: Props) {
  const [categories, setCategories] = useState<{ _id: string, name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // --- SERIES / MOVIE DATA ---
  const [formData, setFormData] = useState({ title: '', description: '', category: '' });
  const [thumbnail, setThumbnail] = useState<File | null>(null); // Main Cover

  // --- EPISODE DATA (Only for Series) ---
  // ✅ Added 'order' to state
  const [epData, setEpData] = useState({ title: 'The Beginning', synopsis: '', order: '1' });
  const [epThumbnail, setEpThumbnail] = useState<File | null>(null);
  const [epVideo, setEpVideo] = useState<File | null>(null); // Main Video for Movie OR Episode

  // Fetch categories
  useEffect(() => {
    api.get('/creator/categories').then(res => {
      setCategories(res.data.data);
      if (res.data.data.length > 0) setFormData(prev => ({ ...prev, category: res.data.data[0].name }));
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!thumbnail) return alert('Series/Movie Cover Image is required');
    if (type === 'movie' && !epVideo) return alert('Movie Video File is required');
    if (type === 'series' && !epVideo) return alert('First Episode Video is required');

    setLoading(true);

    try {
      // ---------------------------------------------------------
      // 1. UPLOAD SERIES/MOVIE COVER
      // ---------------------------------------------------------
      setStatus('Uploading Cover Image...');
      const coverRes = await uploadToCloudinary(thumbnail, 'image');
      const coverImageUrl = coverRes.url;

      // ---------------------------------------------------------
      // 2. CREATE SERIES / MOVIE CONTAINER
      // ---------------------------------------------------------
      setStatus(type === 'series' ? 'Creating Series Container...' : 'Finalizing Movie...');

      // If it's a movie, we upload video now. If series, we wait.
      let movieVideoUrl = '';
      if (type === 'movie' && epVideo) {
        setStatus('Uploading Movie Video (Large file)...');
        const videoRes = await uploadToCloudinary(epVideo, 'video');
        movieVideoUrl = videoRes.url;
      }

      const createRes = await api.post('/creator/series', {
        ...formData,
        coverImage: coverImageUrl,
        videoUrl: movieVideoUrl, // Only used if type == movie
        type
      });

      const newContentId = createRes.data.data._id;

      // ---------------------------------------------------------
      // 3. IF SERIES -> UPLOAD & CREATE FIRST EPISODE
      // ---------------------------------------------------------
      if (type === 'series' && epVideo) {
        setStatus('Uploading Episode Video...');
        const videoRes = await uploadToCloudinary(epVideo, 'video');
        const episodeVideoUrl = videoRes.url;
        const episodeDuration = Math.round(videoRes.duration || 0);

        let episodeThumbUrl = '';
        if (epThumbnail) {
          setStatus('Uploading Episode Thumbnail...');
          const thumbRes = await uploadToCloudinary(epThumbnail, 'image');
          episodeThumbUrl = thumbRes.url;
        }

        setStatus('Linking First Episode...');
        await api.post(`/creator/series/${newContentId}/episodes`, {
          seriesId: newContentId,
          title: epData.title || `Episode ${epData.order}`,
          synopsis: epData.synopsis,
          order: parseInt(epData.order) || 1, // ✅ Use custom order
          video: episodeVideoUrl,
          thumbnail: episodeThumbUrl || coverImageUrl, // Fallback to series cover
          duration: episodeDuration
        });
      }

      setStatus('Success!');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.error?.message || err.response?.data?.message || err.message || 'Unknown error';
      alert(`Failed to create content: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-[#161b22] border border-white/10 w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">

        {/* --- HEADER --- */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-[#0f1117]">
          <div className="flex items-center gap-3">
            <div className={clsx("p-3 rounded-xl", type === 'series' ? "bg-primary/20 text-primary" : "bg-purple-500/20 text-purple-400")}>
              {type === 'series' ? <Layers size={24} /> : <Film size={24} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                Create New {type === 'movie' ? 'Movie' : 'Series'}
              </h2>
              <p className="text-xs text-gray-400">Fill in the details to publish content.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* --- BODY --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* SECTION 1: MAIN INFO */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-xs">1</span>
                {type === 'series' ? 'Series Info' : 'Movie Details'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-300 ml-1">Title</label>
                    <input
                      required type="text" placeholder={type === 'series' ? "Series Name" : "Movie Title"}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                      value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-300 ml-1">Category</label>
                    <select
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-white focus:border-primary outline-none appearance-none cursor-pointer hover:bg-black/60"
                      value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="" disabled>Select Category</option>
                      {categories.map(c => <option key={c._id} value={c.name} className="bg-gray-900">{c.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-300 ml-1">Synopsis</label>
                    <textarea
                      rows={3} placeholder="What is this story about?"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none resize-none"
                      value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* Main Cover Upload */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-300 ml-1">Cover Poster (Portrait)</label>
                  <label className={clsx(
                    "flex flex-col items-center justify-center w-full h-[280px] rounded-2xl border-2 border-dashed cursor-pointer transition-all relative overflow-hidden group",
                    thumbnail ? "border-primary/50 bg-primary/5" : "border-white/10 hover:border-white/30 hover:bg-white/5"
                  )}>
                    {thumbnail ? (
                      <>
                        <img src={URL.createObjectURL(thumbnail)} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" />
                        <div className="relative z-10 flex flex-col items-center">
                          <CheckCircle className="text-primary mb-2" size={32} />
                          <span className="text-sm font-bold text-white shadow-black drop-shadow-md">{thumbnail.name}</span>
                          <span className="text-xs text-primary mt-1">Click to change</span>
                        </div>
                      </>
                    ) : (
                      <div className="text-gray-500 text-center space-y-3 group-hover:scale-105 transition-transform">
                        <div className="p-4 rounded-full bg-white/5 mx-auto"><ImageIcon size={32} /></div>
                        <p className="text-sm font-medium">Click to upload poster</p>
                        <p className="text-[10px] uppercase tracking-wide">JPG, PNG • Max 5MB</p>
                      </div>
                    )}
                    <input type="file" accept="image/*" className="hidden" onChange={e => setThumbnail(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/5" />

            {/* SECTION 2: CONTENT UPLOAD (Episode 1 or Movie File) */}
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/10 text-white flex items-center justify-center text-xs">2</span>
                {type === 'series' ? 'First Episode Assets' : 'Movie File Upload'}
              </h3>

              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                  {/* Left: Input Fields (Only for Series) */}
                  {type === 'series' && (
                    <div className="space-y-5">
                      <div className="flex gap-4">
                        {/* ✅ Episode Number Field */}
                        <div className="w-1/3 space-y-2">
                          <label className="text-xs font-semibold text-gray-300 ml-1">Ep No.</label>
                          <input
                            type="number" min="1"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none text-center font-bold"
                            value={epData.order} onChange={e => setEpData({ ...epData, order: e.target.value })}
                          />
                        </div>
                        {/* Episode Title Field */}
                        <div className="flex-1 space-y-2">
                          <label className="text-xs font-semibold text-gray-300 ml-1">Episode Title</label>
                          <input
                            type="text" placeholder="e.g., The Beginning"
                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none"
                            value={epData.title} onChange={e => setEpData({ ...epData, title: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-300 ml-1">Episode Synopsis</label>
                        <textarea
                          rows={2}
                          placeholder="What happens in this episode?"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary outline-none resize-none"
                          value={epData.synopsis}
                          onChange={e => setEpData({ ...epData, synopsis: e.target.value })}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-300 ml-1">Ep Thumbnail (Optional)</label>
                        <div className="flex items-center gap-4">
                          <label className="flex-1 flex items-center gap-3 px-4 py-3 bg-black/40 border border-white/10 rounded-xl cursor-pointer hover:bg-white/5 transition-colors">
                            <ImageIcon size={18} className="text-gray-400" />
                            <span className="text-sm text-gray-300 truncate">{epThumbnail ? epThumbnail.name : 'Select Image...'}</span>
                            <input type="file" accept="image/*" className="hidden" onChange={e => setEpThumbnail(e.target.files?.[0] || null)} />
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Right: Video Upload (Large Area) */}
                  <div className={clsx("space-y-2", type === 'movie' ? "md:col-span-2" : "")}>
                    <label className="text-xs font-semibold text-gray-300 ml-1">
                      {type === 'series' ? 'Episode Video File' : 'Main Movie File'}
                    </label>
                    <label className={clsx(
                      "flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all group",
                      type === 'series' ? "h-[160px]" : "h-[200px]",
                      epVideo ? "border-purple-500/50 bg-purple-500/5" : "border-white/10 hover:border-white/30 hover:bg-white/5"
                    )}>
                      {epVideo ? (
                        <div className="flex flex-col items-center text-purple-400 animate-pulse-slow">
                          <Film size={40} className="mb-2" />
                          <span className="text-sm font-bold text-white">{epVideo.name}</span>
                          <span className="text-xs opacity-70 mt-1">Ready to upload</span>
                        </div>
                      ) : (
                        <div className="text-gray-500 text-center space-y-2 group-hover:scale-105 transition-transform">
                          <div className="p-3 rounded-full bg-white/5 mx-auto w-fit"><Upload size={24} /></div>
                          <p className="text-sm font-medium">Drag & Drop or Click to Upload Video</p>
                          <p className="text-[10px] uppercase">MP4, MKV • Max 500MB</p>
                        </div>
                      )}
                      <input type="file" accept="video/*" className="hidden" onChange={e => setEpVideo(e.target.files?.[0] || null)} />
                    </label>
                  </div>

                </div>
              </div>
            </div>

          </form>
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="p-6 border-t border-white/5 bg-[#0f1117] flex justify-end gap-4">
          <button onClick={onClose} className="px-6 py-3 rounded-xl text-sm font-bold text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-8 py-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all active:scale-95 disabled:opacity-50 disabled:scale-100 flex items-center gap-2"
          >
            {loading ? <><Loader2 className="animate-spin" size={18} /> {status}</> : <>{type === 'series' ? 'Create Series & Episode' : 'Publish Movie'} <ArrowRight size={18} /></>}
          </button>
        </div>

      </div>
    </div>
  );
}