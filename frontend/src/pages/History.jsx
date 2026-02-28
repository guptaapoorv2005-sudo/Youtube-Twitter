import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History as HistoryIcon, Trash2 } from 'lucide-react';
import { getUserWatchHistory, removeFromWatchHistory } from '../api/watchHistoryApi';
import VideoCard from '../components/VideoCard';
import { VideoCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import { timeAgo } from '../utils/formatters';

export default function History() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserWatchHistory({ page: pageNum, limit: 12 });
      const docs = data.docs || [];
      setEntries((prev) => (append ? [...prev, ...docs] : docs));
      setHasMore(pageNum < (data.totalPages || 1));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(1);
  }, [fetchHistory]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchHistory(next, true);
  };

  const handleRemove = async (videoId) => {
    try {
      await removeFromWatchHistory(videoId);
      setEntries((prev) => prev.filter((e) => e.video?._id !== videoId));
    } catch (err) {
      console.error('Remove from history failed:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-2xl font-bold text-dark-100"
      >
        Watch History
      </motion.h1>

      {error ? (
        <ErrorState message={error} onRetry={() => { setPage(1); fetchHistory(1); }} />
      ) : loading && entries.length === 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <VideoCardSkeleton key={i} />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <EmptyState
          icon={HistoryIcon}
          title="No watch history"
          description="Videos you watch will appear here"
        />
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence>
              {entries.map((entry) => {
                const video = entry.video;
                if (!video) return null;
                return (
                  <motion.div
                    key={entry._id}
                    layout
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="group relative"
                  >
                    <VideoCard video={video} />
                    {/* Watched at badge + remove button */}
                    <div className="mt-1 flex items-center justify-between px-1">
                      <span className="text-xs text-dark-500">
                        Watched {timeAgo(entry.watchedAt)}
                      </span>
                      <button
                        onClick={() => handleRemove(video._id)}
                        className="rounded-lg p-1 text-dark-500 opacity-0 transition-all hover:bg-dark-800 hover:text-red-400 group-hover:opacity-100"
                        title="Remove from history"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <Button variant="secondary" onClick={loadMore} loading={loading}>
                Load more
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
