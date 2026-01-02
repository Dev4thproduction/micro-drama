import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { updateEpisode } from '@/lib/api'; // Make sure this path is correct
import {Button} from '@/components/ui/Button'; // Adjust based on your UI components
import {Input} from '@/components/ui/Input'; // Adjust based on your UI components

interface EditEpisodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  episode: any; // You should replace 'any' with your Episode interface
}

const EditEpisodeModal: React.FC<EditEpisodeModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  episode 
}) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnailUrl: '',
    episodeNumber: '',
    isFree: false
  });

  // Populate form when episode data changes
  useEffect(() => {
    if (episode) {
      setFormData({
        title: episode.title || '',
        description: episode.description || '',
        thumbnailUrl: episode.thumbnailUrl || '',
        episodeNumber: episode.episodeNumber || '',
        isFree: episode.isFree || false
      });
    }
  }, [episode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      await updateEpisode(episode._id, formData);
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

          <div className="grid grid-cols-2 gap-4">
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
            <div className="flex items-center pt-6">
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
            <Button type="button" variant="ghost" onClick={onClose}>
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