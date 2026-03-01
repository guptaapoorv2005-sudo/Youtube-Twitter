import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Image, Save, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { getVideoById, updateVideo, togglePublishStatus } from '../api/videoApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';

export default function EditVideo() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const thumbRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveError, setSaveError] = useState('');

  const [form, setForm] = useState({ title: '', description: '' });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [originalThumbnail, setOriginalThumbnail] = useState(null);
  const [isPublished, setIsPublished] = useState(true);
  const [publishToggling, setPublishToggling] = useState(false);

  const fetchVideo = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getVideoById(videoId);
      if (!data.editableStatus) {
        navigate(`/watch/${videoId}`, { replace: true });
        return;
      }
      setForm({ title: data.title || '', description: data.description || '' });
      setOriginalThumbnail(data.thumbnail);
      setThumbnailPreview(data.thumbnail);
      setIsPublished(data.isPublished ?? true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  }, [videoId, navigate]);

  useEffect(() => {
    fetchVideo();
  }, [fetchVideo]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError('');

    if (!form.title.trim()) return setSaveError('Title is required');
    if (!form.description.trim()) return setSaveError('Description is required');

    const formData = new FormData();
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }

    setSaving(true);
    try {
      await updateVideo(videoId, formData);
      navigate(`/watch/${videoId}`);
    } catch (err) {
      setSaveError(err.response?.data?.message || 'Failed to update video');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl">
        <Skeleton className="mb-6 h-8 w-48" />
        <div className="space-y-5 rounded-2xl border border-dark-800 bg-dark-900 p-6">
          <Skeleton className="h-32 w-56 rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-10 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchVideo} />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center gap-3"
      >
        <button
          onClick={() => navigate(`/watch/${videoId}`)}
          className="rounded-lg p-1.5 text-dark-400 hover:text-dark-100 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-dark-100">Edit Video</h1>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dark-800 bg-dark-900 p-6"
      >
        {saveError && (
          <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {saveError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Thumbnail</label>
            <div className="flex gap-4 items-end">
              <button
                type="button"
                onClick={() => thumbRef.current?.click()}
                className="flex h-32 w-56 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-dark-600 bg-dark-800/50 transition-colors hover:border-accent-500"
              >
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-dark-400">
                    <Image className="h-6 w-6" />
                    <span className="text-xs">Change thumbnail</span>
                  </div>
                )}
              </button>
              {thumbnailFile && (
                <button
                  type="button"
                  onClick={() => {
                    setThumbnailFile(null);
                    setThumbnailPreview(originalThumbnail);
                  }}
                  className="text-xs text-dark-400 hover:text-dark-200 transition-colors"
                >
                  Reset
                </button>
              )}
              <input
                ref={thumbRef}
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
            </div>
          </div>

          <Input
            label="Title *"
            placeholder="Enter video title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />

          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1.5">Description *</label>
            <textarea
              placeholder="Describe your video..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full resize-none rounded-xl border border-dark-700 bg-dark-800 px-4 py-2.5 text-sm text-dark-100 placeholder-dark-500 outline-none transition-colors focus:border-accent-500 focus:ring-1 focus:ring-accent-500/30"
            />
          </div>

          {/* Publish toggle */}
          <div className="flex items-center justify-between rounded-xl border border-dark-700 bg-dark-800 px-4 py-3">
            <div className="flex items-center gap-3">
              {isPublished ? (
                <Eye className="h-5 w-5 text-green-400" />
              ) : (
                <EyeOff className="h-5 w-5 text-dark-400" />
              )}
              <div>
                <p className="text-sm font-medium text-dark-100">
                  {isPublished ? 'Public' : 'Draft'}
                </p>
                <p className="text-xs text-dark-400">
                  {isPublished
                    ? 'Anyone can view this video'
                    : 'Only you can see this video'}
                </p>
              </div>
            </div>
            <button
              type="button"
              disabled={publishToggling}
              onClick={async () => {
                try {
                  setPublishToggling(true);
                  const result = await togglePublishStatus(videoId);
                  setIsPublished(result.isPublished);
                } catch (err) {
                  console.error('Toggle publish failed:', err);
                } finally {
                  setPublishToggling(false);
                }
              }}
              className={`relative h-6 w-11 rounded-full transition-colors disabled:opacity-50 ${
                isPublished ? 'bg-accent-500' : 'bg-dark-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  isPublished ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="flex-1"
              onClick={() => navigate(`/watch/${videoId}`)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="brand" className="flex-1" loading={saving}>
              <Save className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
