import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload as UploadIcon, Film, Image, X, Eye, EyeOff } from 'lucide-react';
import { publishVideo } from '../api/videoApi';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

export default function Upload() {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const thumbRef = useRef(null);

  const [form, setForm] = useState({ title: '', description: '', isPublished: true });
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!videoFile) return setError('Video file is required');
    if (!thumbnailFile) return setError('Thumbnail is required');
    if (!form.title.trim()) return setError('Title is required');
    if (!form.description.trim()) return setError('Description is required');

    const formData = new FormData();
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnailFile);
    formData.append('title', form.title.trim());
    formData.append('description', form.description.trim());
    formData.append('publishStatus', form.isPublished);

    setLoading(true);
    try {
      const published = await publishVideo(formData);
      navigate(`/watch/${published._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Upload failed');
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-2xl font-bold text-dark-100"
      >
        Upload Video
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-dark-800 bg-dark-900 p-6"
      >
        {error && (
          <div className="mb-4 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Video file */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Video File *</label>
            {videoFile ? (
              <div className="flex items-center gap-3 rounded-xl border border-dark-700 bg-dark-800 p-4">
                <Film className="h-8 w-8 text-accent-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-dark-100">{videoFile.name}</p>
                  <p className="text-xs text-dark-400">
                    {(videoFile.size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVideoFile(null)}
                  className="rounded-lg p-1 text-dark-400 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => videoRef.current?.click()}
                className="flex w-full flex-col items-center gap-3 rounded-xl border-2 border-dashed border-dark-600 bg-dark-800/50 py-12 text-dark-400 transition-colors hover:border-accent-500 hover:text-accent-400"
              >
                <UploadIcon className="h-10 w-10" />
                <span className="text-sm font-medium">Click to select video</span>
                <span className="text-xs">MP4, WebM, MOV</span>
              </button>
            )}
            <input
              ref={videoRef}
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="hidden"
            />
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-2">Thumbnail *</label>
            <div className="flex gap-4">
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
                    <span className="text-xs">Add thumbnail</span>
                  </div>
                )}
              </button>
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
              {form.isPublished ? (
                <Eye className="h-5 w-5 text-green-400" />
              ) : (
                <EyeOff className="h-5 w-5 text-dark-400" />
              )}
              <div>
                <p className="text-sm font-medium text-dark-100">
                  {form.isPublished ? 'Public' : 'Draft'}
                </p>
                <p className="text-xs text-dark-400">
                  {form.isPublished
                    ? 'Anyone can view this video'
                    : 'Only you can see this video'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, isPublished: !form.isPublished })}
              className={`relative h-6 w-11 rounded-full transition-colors ${
                form.isPublished ? 'bg-accent-500' : 'bg-dark-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                  form.isPublished ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Progress */}
          {loading && uploadProgress > 0 && (
            <div className="h-2 overflow-hidden rounded-full bg-dark-800">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                className="h-full bg-linear-to-r from-accent-500 to-brand-500"
              />
            </div>
          )}

          <Button type="submit" variant="brand" className="w-full" loading={loading}>
            <UploadIcon className="h-4 w-4" />
            {form.isPublished ? 'Publish Video' : 'Save as Draft'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
