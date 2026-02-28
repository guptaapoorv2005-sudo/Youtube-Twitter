import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ListVideo, Plus, Globe, Lock, Trash2 } from 'lucide-react';
import { getUserPlaylists, createPlaylist, deletePlaylist, togglePlaylistPublicStatus } from '../api/playlistApi';
import { useAuth } from '../hooks/useAuth';
import Modal from '../components/ui/Modal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import { timeAgo } from '../utils/formatters';

export default function Playlists() {
  const { user } = useAuth();
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newPlaylist, setNewPlaylist] = useState({ name: '', description: '' });

  useEffect(() => {
    const fetch = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const data = await getUserPlaylists(user._id, { limit: 50 });
        setPlaylists(data.playlists || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load playlists');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?._id]);

  const handleCreate = async () => {
    if (!newPlaylist.name.trim()) return;
    setCreating(true);
    try {
      const created = await createPlaylist({
        name: newPlaylist.name.trim(),
        description: newPlaylist.description.trim(),
      });
      setPlaylists((prev) => [created, ...prev]);
      setShowCreate(false);
      setNewPlaylist({ name: '', description: '' });
    } catch (err) {
      console.error('Create playlist failed:', err);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error('Delete playlist failed:', err);
    }
  };

  const handleTogglePublic = async (id) => {
    try {
      const updated = await togglePlaylistPublicStatus(id);
      setPlaylists((prev) =>
        prev.map((p) => (p._id === id ? { ...p, isPublic: updated.isPublic } : p))
      );
    } catch (err) {
      console.error('Toggle public failed:', err);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center justify-between">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-dark-100"
        >
          Playlists
        </motion.h1>
        <Button variant="brand" size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4" />
          New Playlist
        </Button>
      </div>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      ) : playlists.length === 0 ? (
        <EmptyState
          icon={ListVideo}
          title="No playlists"
          description="Create your first playlist to organize videos"
        />
      ) : (
        <div className="space-y-3">
          {playlists.map((pl) => (
            <motion.div
              key={pl._id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 rounded-xl border border-dark-800 bg-dark-900 p-4 transition-colors hover:border-dark-700"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-dark-800">
                <ListVideo className="h-6 w-6 text-accent-400" />
              </div>
              <Link to={`/playlists/${pl._id}`} className="min-w-0 flex-1">
                <h3 className="font-medium text-dark-100 hover:text-accent-400 transition-colors">
                  {pl.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-dark-400">
                  <span>{pl.totalVideos || 0} videos</span>
                  <span>·</span>
                  <span>{timeAgo(pl.createdAt)}</span>
                </div>
              </Link>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleTogglePublic(pl._id)}
                  className="rounded-lg p-2 text-dark-400 hover:bg-dark-800 hover:text-dark-200 transition-colors"
                  title={pl.isPublic ? 'Public' : 'Private'}
                >
                  {pl.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                </button>
                <button
                  onClick={() => handleDelete(pl._id)}
                  className="rounded-lg p-2 text-dark-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Playlist Modal */}
      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Playlist">
        <div className="space-y-4">
          <Input
            label="Name"
            placeholder="Playlist name"
            value={newPlaylist.name}
            onChange={(e) => setNewPlaylist({ ...newPlaylist, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-dark-200 mb-1.5">Description</label>
            <textarea
              placeholder="Optional description"
              value={newPlaylist.description}
              onChange={(e) => setNewPlaylist({ ...newPlaylist, description: e.target.value })}
              rows={3}
              className="w-full resize-none rounded-xl border border-dark-700 bg-dark-800 px-4 py-2.5 text-sm text-dark-100 placeholder-dark-500 outline-none transition-colors focus:border-accent-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowCreate(false)}>
              Cancel
            </Button>
            <Button
              variant="brand"
              size="sm"
              onClick={handleCreate}
              loading={creating}
              disabled={!newPlaylist.name.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
