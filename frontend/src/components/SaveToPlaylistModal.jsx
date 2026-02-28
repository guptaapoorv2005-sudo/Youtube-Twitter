import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Check, Loader2, ListMusic } from 'lucide-react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { getUserPlaylists, createPlaylist, addVideoToPlaylist } from '../api/playlistApi';
import { useAuth } from '../hooks/useAuth';

export default function SaveToPlaylistModal({ isOpen, onClose, videoId }) {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(null); // playlistId currently being saved to
  const [savedIds, setSavedIds] = useState(new Set());
  const [error, setError] = useState('');

  // New playlist form
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    if (isOpen && user?._id) {
      fetchPlaylists();
    }
    // Reset state on close
    if (!isOpen) {
      setShowCreate(false);
      setNewName('');
      setNewDescription('');
      setCreateError('');
      setError('');
      setSavedIds(new Set());
    }
  }, [isOpen, user?._id]);

  const fetchPlaylists = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserPlaylists(user._id, { limit: 50 });
      setPlaylists(data.playlists || []);
    } catch (err) {
      setError('Failed to load playlists');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPlaylist = async (playlistId) => {
    try {
      setSaving(playlistId);
      await addVideoToPlaylist(playlistId, videoId);
      setSavedIds((prev) => new Set(prev).add(playlistId));
      setPlaylists((prev) =>
        prev.map((p) =>
          p._id === playlistId ? { ...p, totalVideos: (p.totalVideos ?? 0) + 1 } : p
        )
      );
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add video';
      setError(msg);
    } finally {
      setSaving(null);
    }
  };

  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    try {
      setCreating(true);
      setCreateError('');
      const playlist = await createPlaylist({ name: newName.trim(), description: newDescription.trim() });
      // Add video to the newly created playlist
      await addVideoToPlaylist(playlist._id, videoId);
      setSavedIds((prev) => new Set(prev).add(playlist._id));
      setPlaylists((prev) => [{ ...playlist, totalVideos: 1 }, ...prev]);
      setNewName('');
      setNewDescription('');
      setShowCreate(false);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create playlist';
      setCreateError(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Save to playlist">
      <div className="max-h-80 space-y-1 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-dark-400" />
          </div>
        ) : error && playlists.length === 0 ? (
          <p className="py-4 text-center text-sm text-red-400">{error}</p>
        ) : playlists.length === 0 ? (
          <p className="py-4 text-center text-sm text-dark-400">
            No playlists yet. Create one below!
          </p>
        ) : (
          playlists.map((pl) => {
            const isSaved = savedIds.has(pl._id);
            const isSaving = saving === pl._id;
            return (
              <motion.button
                key={pl._id}
                whileHover={{ x: 2 }}
                onClick={() => !isSaved && !isSaving && handleAddToPlaylist(pl._id)}
                disabled={isSaved || isSaving}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors ${
                  isSaved
                    ? 'bg-accent-500/10 text-accent-400'
                    : 'text-dark-200 hover:bg-dark-800'
                } disabled:cursor-default`}
              >
                <ListMusic className="h-4 w-4 shrink-0 text-dark-400" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{pl.name}</p>
                  <p className="text-xs text-dark-500">{pl.totalVideos ?? 0} videos</p>
                </div>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin text-dark-400" />
                ) : isSaved ? (
                  <Check className="h-4 w-4 text-accent-400" />
                ) : null}
              </motion.button>
            );
          })
        )}

        {error && playlists.length > 0 && (
          <p className="px-2 text-xs text-red-400">{error}</p>
        )}
      </div>

      {/* Create new playlist */}
      <div className="mt-4 border-t border-dark-700 pt-4">
        <AnimatePresence mode="wait">
          {!showCreate ? (
            <motion.button
              key="create-btn"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(true)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-dark-200 transition-colors hover:bg-dark-800"
            >
              <Plus className="h-4 w-4" />
              Create new playlist
            </motion.button>
          ) : (
            <motion.form
              key="create-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreatePlaylist}
              className="space-y-3 overflow-hidden"
            >
              <input
                type="text"
                placeholder="Playlist name *"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                autoFocus
                className="w-full rounded-xl border border-dark-700 bg-dark-800 px-4 py-2.5 text-sm text-dark-100 placeholder-dark-500 outline-none transition-colors focus:border-accent-500"
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                className="w-full rounded-xl border border-dark-700 bg-dark-800 px-4 py-2.5 text-sm text-dark-100 placeholder-dark-500 outline-none transition-colors focus:border-accent-500"
              />
              {createError && <p className="text-xs text-red-400">{createError}</p>}
              <div className="flex gap-2">
                <Button type="submit" variant="brand" size="sm" loading={creating} disabled={!newName.trim()}>
                  Create & Save
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowCreate(false);
                    setNewName('');
                    setNewDescription('');
                    setCreateError('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
