import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Film } from 'lucide-react';
import { getPlaylistById } from '../api/playlistApi';
import VideoCard from '../components/VideoCard';
import { VideoCardSkeleton, Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Avatar from '../components/ui/Avatar';

export default function PlaylistDetail() {
  const { playlistId } = useParams();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getPlaylistById(playlistId);
        setPlaylist(data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load playlist');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [playlistId]);

  if (loading) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-5 w-32" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) return <ErrorState message={error} />;
  if (!playlist) return null;

  const owner = playlist.owner || {};
  const videos = playlist.videos || [];

  return (
    <div className="mx-auto max-w-6xl">
      <Link to="/playlists" className="mb-4 inline-flex items-center gap-1 text-sm text-dark-400 hover:text-dark-200 transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to playlists
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl border border-dark-800 bg-dark-900 p-6"
      >
        <h1 className="text-2xl font-bold text-dark-100">{playlist.name}</h1>
        {playlist.description && (
          <p className="mt-1 text-sm text-dark-400">{playlist.description}</p>
        )}
        <div className="mt-3 flex items-center gap-3">
          <Link to={`/channel/${owner.username}`} className="flex items-center gap-2">
            <Avatar src={owner.avatar} alt={owner.fullName} size="sm" />
            <span className="text-sm font-medium text-dark-200 hover:text-accent-400 transition-colors">
              {owner.fullName}
            </span>
          </Link>
          <span className="text-xs text-dark-500">{videos.length} videos</span>
        </div>
      </motion.div>

      {/* Videos */}
      {videos.length === 0 ? (
        <EmptyState icon={Film} title="Empty playlist" description="No videos in this playlist yet" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
