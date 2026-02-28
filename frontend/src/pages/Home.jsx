import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, MessageCircle, Send } from 'lucide-react';
import { getAllVideos } from '../api/videoApi';
import { createTweet, getAllTweets } from '../api/tweetApi';
import { useAuth } from '../hooks/useAuth';
import VideoCard from '../components/VideoCard';
import TweetCard from '../components/TweetCard';
import { VideoCardSkeleton, TweetCardSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';

export default function Home() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('q') || '';

  const [tab, setTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [tweetCursor, setTweetCursor] = useState(null);
  const [hasMoreTweets, setHasMoreTweets] = useState(true);

  // Tweet compose
  const [tweetContent, setTweetContent] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchVideos = useCallback(async (pageNum = 1, append = false) => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllVideos({
        page: pageNum,
        limit: 12,
        query: searchQuery || undefined,
        sortBy: 'createdAt',
        sortType: 'desc',
      });
      const docs = data.docs || [];
      setVideos((prev) => (append ? [...prev, ...docs] : docs));
      setHasMore(pageNum < (data.totalPages || 1));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [searchQuery]);

  const fetchTweets = useCallback(async (cursor = null, append = false) => {
    try {
      setLoading(true);
      setError('');
      const data = await getAllTweets({ limit: 10, cursor: cursor || undefined });
      const list = data.tweets || [];
      setTweets((prev) => (append ? [...prev, ...list] : list));
      setTweetCursor(data.nextCursor || null);
      setHasMoreTweets(!!data.nextCursor);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tweets');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    if (tab === 'videos') {
      fetchVideos(1);
    } else {
      fetchTweets();
    }
  }, [tab, fetchVideos, fetchTweets]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchVideos(nextPage, true);
  };

  const handlePostTweet = async () => {
    if (!tweetContent.trim() || posting) return;
    setPosting(true);
    try {
      const newTweet = await createTweet(tweetContent.trim());
      setTweets((prev) => [newTweet, ...prev]);
      setTweetContent('');
    } catch (err) {
      console.error('Post tweet failed:', err);
    } finally {
      setPosting(false);
    }
  };

  const handleTweetDelete = (tweetId) => {
    setTweets((prev) => prev.filter((t) => t._id !== tweetId));
  };

  const handleTweetUpdate = (updated) => {
    setTweets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
  };

  return (
    <div className="mx-auto max-w-7xl">
      {/* Search heading */}
      {searchQuery && (
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 text-xl font-semibold text-dark-100"
        >
          Results for &quot;{searchQuery}&quot;
        </motion.h2>
      )}

      {/* Tab toggle */}
      <div className="mb-6 flex items-center gap-1 rounded-xl bg-dark-900 p-1 w-fit border border-dark-800">
        {[
          { id: 'videos', label: 'Videos', icon: Film },
          { id: 'tweets', label: 'Tweets', icon: MessageCircle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors ${
              tab === id ? 'text-white' : 'text-dark-400 hover:text-dark-200'
            }`}
          >
            {tab === id && (
              <motion.div
                layoutId="homeTab"
                className="absolute inset-0 rounded-lg bg-linear-to-r from-accent-500 to-brand-500"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
              />
            )}
            <span className="relative flex items-center gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {tab === 'videos' ? (
          <motion.div
            key="videos"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.2 }}
          >
            {error ? (
              <ErrorState message={error} onRetry={() => fetchVideos(1)} />
            ) : loading && videos.length === 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <VideoCardSkeleton key={i} />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <EmptyState
                icon={Film}
                title="No videos yet"
                description={searchQuery ? 'Try a different search query' : 'Be the first to upload a video!'}
              />
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {videos.map((video) => (
                    <VideoCard key={video._id} video={video} />
                  ))}
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
          </motion.div>
        ) : (
          <motion.div
            key="tweets"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="mx-auto max-w-2xl space-y-4"
          >
            {/* Compose */}
            <div className="rounded-2xl border border-dark-800 bg-dark-900 p-4">
              <textarea
                placeholder="What's on your mind?"
                value={tweetContent}
                onChange={(e) => setTweetContent(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-xl border border-dark-700 bg-dark-800 p-3 text-sm text-dark-100 placeholder-dark-500 outline-none transition-colors focus:border-accent-500"
              />
              <div className="mt-3 flex justify-end">
                <Button
                  variant="brand"
                  size="sm"
                  onClick={handlePostTweet}
                  loading={posting}
                  disabled={!tweetContent.trim()}
                >
                  <Send className="h-3.5 w-3.5" />
                  Post
                </Button>
              </div>
            </div>

            {error ? (
              <ErrorState message={error} onRetry={fetchTweets} />
            ) : loading && tweets.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => <TweetCardSkeleton key={i} />)
            ) : tweets.length === 0 ? (
              <EmptyState
                icon={MessageCircle}
                title="No tweets yet"
                description="Share your first thought with the world!"
              />
            ) : (
              <>
                {tweets.map((tweet) => (
                  <TweetCard
                    key={tweet._id}
                    tweet={tweet}
                    onDelete={handleTweetDelete}
                    onUpdate={handleTweetUpdate}
                  />
                ))}
                {hasMoreTweets && (
                  <div className="flex justify-center pt-2">
                    <Button variant="secondary" size="sm" onClick={() => fetchTweets(tweetCursor, true)} loading={loading}>
                      Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
