import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, Loader2 } from 'lucide-react';
import { getLikedVideos } from '../api/likeApi';
import VideoCard from '../components/VideoCard';
import { VideoCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function LikedVideos() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const [cursor, setCursor] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const sentinelRef = useRef(null);

  const fetchVideos = useCallback(async (cursorVal = null, append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);
      setError('');
      const data = await getLikedVideos({ cursor: cursorVal || undefined, limit: 12 });
      const mapped = (data.likedVideos || [])
        .filter((item) => item.video)
        .map((item) => item.video);
      setVideos((prev) => (append ? [...prev, ...mapped] : mapped));
      setCursor(data.nextCursor || null);
      setHasMore(data.hasMore);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load liked videos');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && cursor) {
          fetchVideos(cursor, true);
        }
      },
      { rootMargin: '200px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, cursor, fetchVideos]);

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
        <ErrorState message={error} onRetry={() => fetchVideos()} />
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
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {videos.map((video) => (
              <VideoCard key={video._id} video={video} />
            ))}
          </div>
          {/* Sentinel element for infinite scroll */}
          {hasMore && (
            <div ref={sentinelRef} className="flex justify-center py-8">
              {loadingMore && <Loader2 className="h-6 w-6 animate-spin text-dark-400" />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
