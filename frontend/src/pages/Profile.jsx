import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Film, MessageCircle, Users, Eye, ThumbsUp, Video, ListVideo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getUserChannelProfile } from '../api/userApi';
import { getChannelStats, getChannelVideos } from '../api/dashboardApi';
import { getAllTweets } from '../api/tweetApi';
import { toggleSubscription } from '../api/subscriptionApi';
import { getUserPlaylists } from '../api/playlistApi';
import { useAuth } from '../hooks/useAuth';
import VideoCard from '../components/VideoCard';
import TweetCard from '../components/TweetCard';
import { VideoCardSkeleton, TweetCardSkeleton, ProfileSkeleton, Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';
import Button from '../components/ui/Button';
import SortDropdown from '../components/ui/SortDropdown';
import { formatViews } from '../utils/formatters';

export default function Profile() {
  const { username } = useParams();
  const { user } = useAuth();

  const [channel, setChannel] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

  const [tab, setTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [tweets, setTweets] = useState([]);
  const [contentLoading, setContentLoading] = useState(true);
  const [videoCursor, setVideoCursor] = useState(null);
  const [hasMoreVideos, setHasMoreVideos] = useState(true);
  const [videoSortBy, setVideoSortBy] = useState('createdAt');
  const [videoSortType, setVideoSortType] = useState('desc');
  const [tweetCursor, setTweetCursor] = useState(null);
  const [hasMoreTweets, setHasMoreTweets] = useState(true);
  const [playlists, setPlaylists] = useState([]);
  const [playlistCursor, setPlaylistCursor] = useState(null);
  const [hasMorePlaylists, setHasMorePlaylists] = useState(true);

  const fetchChannel = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getUserChannelProfile(username);
      setChannel(data);
      setIsSubscribed(data.isSubscribed || false);

      // Fetch stats
      if (data._id) {
        const statsData = await getChannelStats(data._id);
        setStats(statsData);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load channel');
    } finally {
      setLoading(false);
    }
  }, [username]);

  const fetchVideos = useCallback(async (cursor = null, append = false) => {
    if (!channel?._id) return;
    try {
      setContentLoading(true);
      const data = await getChannelVideos({ channelId: channel._id, cursor, limit: 12, sortBy: videoSortBy, sortType: videoSortType });
      setVideos((prev) => (append ? [...prev, ...data.videos] : data.videos));
      setVideoCursor(data.nextCursor);
      setHasMoreVideos(data.hasMore);
    } catch (err) {
      console.error('Fetch videos failed:', err);
    } finally {
      setContentLoading(false);
    }
  }, [channel?._id, videoSortBy, videoSortType]);

  const fetchTweets = useCallback(async (cursor = null, append = false) => {
    if (!channel?._id) return;
    try {
      setContentLoading(true);
      const data = await getAllTweets({ userId: channel._id, limit: 10, cursor: cursor || undefined });
      const list = data.tweets || [];
      setTweets((prev) => (append ? [...prev, ...list] : list));
      setTweetCursor(data.nextCursor || null);
      setHasMoreTweets(!!data.nextCursor);
    } catch (err) {
      console.error('Fetch tweets failed:', err);
    } finally {
      setContentLoading(false);
    }
  }, [channel?._id]);

  const fetchPlaylists = useCallback(async (cursor = null, append = false) => {
    if (!channel?._id) return;
    try {
      setContentLoading(true);
      const data = await getUserPlaylists(channel._id, { limit: 12, cursor: cursor || undefined });
      const list = data.playlists || [];
      setPlaylists((prev) => (append ? [...prev, ...list] : list));
      setPlaylistCursor(data.nextCursor || null);
      setHasMorePlaylists(!!data.nextCursor);
    } catch (err) {
      console.error('Fetch playlists failed:', err);
    } finally {
      setContentLoading(false);
    }
  }, [channel?._id]);

  useEffect(() => {
    fetchChannel();
  }, [fetchChannel]);

  useEffect(() => {
    if (channel) {
      if (tab === 'videos') fetchVideos();
      else if (tab === 'tweets') fetchTweets();
      else if (tab === 'playlists') fetchPlaylists();
    }
  }, [channel, tab, fetchVideos, fetchTweets, fetchPlaylists]);

  const handleSubscribe = async () => {
    if (!channel?._id || subLoading) return;
    setSubLoading(true);
    try {
      const result = await toggleSubscription(channel._id);
      const delta = result.subscribed ? 1 : -1;
      setIsSubscribed(result.subscribed);
      setChannel((prev) => ({
        ...prev,
        subscribersCount: prev.subscribersCount + delta,
      }));
      setStats((prev) => prev ? { ...prev, totalSubscribers: prev.totalSubscribers + delta } : prev);
    } catch (err) {
      console.error('Subscribe failed:', err);
    } finally {
      setSubLoading(false);
    }
  };

  const handleTweetDelete = (tweetId) => setTweets((prev) => prev.filter((t) => t._id !== tweetId));
  const handleTweetUpdate = (updated) => setTweets((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));

  if (loading) return <ProfileSkeleton />;
  if (error) return <ErrorState message={error} onRetry={fetchChannel} />;
  if (!channel) return null;

  const isOwnProfile = user?._id === channel._id;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Cover image */}
      <div className="relative h-48 md:h-56 overflow-hidden rounded-2xl bg-linear-to-br from-accent-500/30 to-brand-500/30">
        {channel.coverImage && (
          <img src={channel.coverImage} alt="Cover" className="h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-dark-950/80 to-transparent" />
      </div>

      {/* Profile info */}
      <div className="relative -mt-16 px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end gap-4">
          <div className="h-28 w-28 overflow-hidden rounded-full border-4 border-dark-950 bg-dark-800 ring-4 ring-dark-900">
            <img src={channel.avatar} alt={channel.fullName} className="h-full w-full object-cover" />
          </div>

          <div className="flex-1 pb-2">
            <h1 className="text-2xl font-bold text-dark-100">{channel.fullName}</h1>
            <p className="text-sm text-dark-400">@{channel.username}</p>
            <div className="mt-1 flex items-center gap-4 text-xs text-dark-400">
              <span>{formatViews(channel.subscribersCount)} subscribers</span>
              <span>{channel.subscribedToCount} subscriptions</span>
            </div>
          </div>

          {!isOwnProfile && (
            <Button
              variant={isSubscribed ? 'secondary' : 'brand'}
              onClick={handleSubscribe}
              loading={subLoading}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </Button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 px-4 md:px-0">
          {[
            { label: 'Videos', value: stats.videosCount, icon: Video },
            { label: 'Views', value: stats.views, icon: Eye },
            { label: 'Likes', value: stats.likes, icon: ThumbsUp },
            { label: 'Subscribers', value: stats.totalSubscribers, icon: Users },
          ].map(({ label, value, icon: Icon }) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-dark-800 bg-dark-900 p-4 text-center"
            >
              <Icon className="mx-auto mb-2 h-5 w-5 text-accent-400" />
              <p className="text-lg font-bold text-dark-100">{formatViews(value)}</p>
              <p className="text-xs text-dark-400">{label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Content tabs */}
      <div className="mt-6 mb-4 flex items-center gap-1 rounded-xl bg-dark-900 p-1 w-fit border border-dark-800">
        {[
          { id: 'videos', label: 'Videos', icon: Film },
          { id: 'tweets', label: 'Tweets', icon: MessageCircle },
          { id: 'playlists', label: 'Playlists', icon: ListVideo },
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
                layoutId="profileTab"
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
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Sort dropdown */}
            <div className="mb-4">
              <SortDropdown
                value={`${videoSortBy}:${videoSortType}`}
                onChange={(val) => {
                  const [newSortBy, newSortType] = val.split(':');
                  setVideoSortBy(newSortBy);
                  setVideoSortType(newSortType);
                  setVideoCursor(null);
                }}
              />
            </div>

            {contentLoading && videos.length === 0 ? (
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <VideoCardSkeleton key={i} />
                ))}
              </div>
            ) : videos.length === 0 ? (
              <EmptyState icon={Film} title="No videos" description="This channel hasn't uploaded any videos yet." />
            ) : (
              <>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {videos.map((v) => (
                    <VideoCard key={v._id} video={v} />
                  ))}
                </div>
                {hasMoreVideos && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fetchVideos(videoCursor, true)}
                      loading={contentLoading}
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : tab === 'tweets' ? (
          <motion.div
            key="tweets"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto max-w-2xl space-y-3"
          >
            {contentLoading && tweets.length === 0 ? (
              Array.from({ length: 3 }).map((_, i) => <TweetCardSkeleton key={i} />)
            ) : tweets.length === 0 ? (
              <EmptyState icon={MessageCircle} title="No tweets" description="This channel hasn't posted any tweets yet." />
            ) : (
              <>
                {tweets.map((tweet) => (
                  <TweetCard
                    key={tweet._id}
                    tweet={tweet}
                    onDelete={isOwnProfile ? handleTweetDelete : undefined}
                    onUpdate={isOwnProfile ? handleTweetUpdate : undefined}
                  />
                ))}
                {hasMoreTweets && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fetchTweets(tweetCursor, true)}
                      loading={contentLoading}
                    >
                      Load more
                    </Button>
                  </div>
                )}
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="playlists"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-3"
          >
            {contentLoading && playlists.length === 0 ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-20 w-full rounded-xl" />
                ))}
              </div>
            ) : playlists.length === 0 ? (
              <EmptyState icon={ListVideo} title="No playlists" description="This channel doesn't have any public playlists yet." />
            ) : (
              <>
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
                          <span>{pl.isPublic ? 'Public' : 'Private'}</span>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
                {hasMorePlaylists && (
                  <div className="mt-6 flex justify-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => fetchPlaylists(playlistCursor, true)}
                      loading={contentLoading}
                    >
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
