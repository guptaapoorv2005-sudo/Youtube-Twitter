import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp } from 'lucide-react';
import { getLikedVideos } from '../api/likeApi';
import VideoCard from '../components/VideoCard';
import { VideoCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function LikedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getLikedVideos();
        // Each item is { video: { thumbnail, owner, title, duration } }
        const mapped = (Array.isArray(data) ? data : [])
          .filter((item) => item.video)
          .map((item) => item.video);
        setVideos(mapped);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load liked videos');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="mx-auto max-w-7xl">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-2xl font-bold text-dark-100"
      >
        Liked Videos
      </motion.h1>

      {error ? (
        <ErrorState message={error} onRetry={() => window.location.reload()} />
      ) : loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <EmptyState
          icon={ThumbsUp}
          title="No liked videos"
          description="Videos you like will appear here"
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {videos.map((video) => (
            <VideoCard key={video._id} video={video} />
          ))}
        </div>
      )}
    </div>
  );
}
