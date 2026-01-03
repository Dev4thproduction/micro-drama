import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface EditEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  episode: any;
}

const EditEpisodeModal: React.FC<EditEpisodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  episode
}) => {
  const [loading, setLoading] = useState(false);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    episodeNumber: '',
    isFree: false,
    seasonId: ''
  });

  // Fetch seasons
  useEffect(() => {
    if (episode?.series) {
      const seriesId = typeof episode.series === 'object' ? episode.series._id : episode.series;
      api.get(`/admin/series/${seriesId}/seasons`).then(res => {
        setSeasons(res.data.data);
      });
    }
  }, [episode]);

  // Populate form when episode data changes
  useEffect(() => {
    if (episode) {
      setFormData({
        title: episode.title || '',
        description: episode.synopsis || episode.description || '',
        thumbnailUrl: episode.thumbnailUrl || episode.thumbnail || '',
        episodeNumber: episode.order?.toString() || episode.episodeNumber?.toString() || '',
        isFree: episode.isFree || false,
        seasonId: (typeof episode.season === 'object' ? episode.season?._id : episode.season) || ''
      });
    }
  }, [episode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, isFree: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!episode?._id) return;

    setLoading(true);
    try {
      const payload = {
        ...formData,
        synopsis: formData.description,
        order: parseInt(formData.episodeNumber) || 1
      };
      await api.patch(`/admin/episodes/${episode._id}`, payload);

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to update episode', error);
      alert('Failed to update episode');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-lg shadow-2xl animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-white">Edit Episode</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Season</label>
              <select
                name="seasonId"
                value={formData.seasonId}
                onChange={handleChange}
                className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-600"
              >
                <option value="">No Season</option>
                {seasons.map(s => (
                  <option key={s._id} value={s._id}>Season {s.number}: {s.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-1">Episode Number</label>
              <Input
                type="number"
                name="episodeNumber"
                value={formData.episodeNumber}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Episode Title</label>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. The Beginning"
              required
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFree"
                checked={formData.isFree}
                onChange={handleCheckboxChange}
                className="rounded border-zinc-700 bg-zinc-800 text-red-600 focus:ring-red-600"
              />
              <span className="text-sm text-zinc-300">Free Episode?</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Synopsis</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full rounded-md border border-zinc-800 bg-zinc-950 px-3 py-2 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
              placeholder="Episode summary..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-400 mb-1">Thumbnail URL</label>
            <Input
              name="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={handleChange}
              placeholder="https://..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditEpisodeModal;