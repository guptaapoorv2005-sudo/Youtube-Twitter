import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { videosAPI } from '../services/api';
import { VideoPlayer } from '../components/video/VideoPlayer';
import { VideoDetailCard } from '../components/video/VideoDetailCard';
import { VideoCard } from '../components/video/VideoCard';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/EmptyState';
import { AlertCircle } from 'lucide-react';

export const VideoWatch = () => {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const [video, setVideo] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        setError(null);
        const [videoRes, suggestionsRes] = await Promise.all([
          videosAPI.getVideo(videoId),
          videosAPI.getVideoSuggestions(videoId, 8),
        ]);
        setVideo(videoRes.data.data);
        setSuggestions(suggestionsRes.data.data);
        setIsSubscribed(videoRes.data.data.channel?.isSubscribed || false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load video');
        console.error('Fetch video error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (videoId) {
      fetchVideo();
    }
  }, [videoId]);

  const handleLike = async () => {
    try {
      await videosAPI.likeVideo(videoId);
      setVideo((prev) => ({
        ...prev,
        isLiked: !prev.isLiked,
        likes: prev.isLiked ? prev.likes - 1 : prev.likes + 1,
      }));
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleSubscribe = async () => {
    try {
      if (isSubscribed) {
        await videosAPI.unsubscribe(video.channel._id);
      } else {
        await videosAPI.subscribe(video.channel._id);
      }
      setIsSubscribed(!isSubscribed);
    } catch (err) {
      console.error('Subscribe error:', err);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState
          title="Video not found"
          description={error}
          onRetry={() => navigate('/explore')}
          icon={AlertCircle}
        />
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2">
          {/* Video Player */}
          <VideoPlayer
            videoUrl={video?.videoUrl}
            poster={video?.thumbnail}
            title={video?.title}
          />

          {/* Video Details */}
          <div className="mt-6">
            <VideoDetailCard
              video={video}
              onLike={handleLike}
              onComment={() => console.log('Comment')}
              onSubscribe={handleSubscribe}
              isSubscribed={isSubscribed}
            />
          </div>
        </div>

        {/* Sidebar - Suggestions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Suggestions</h3>
          {suggestions.map((suggestionVideo) => (
            <motion.div
              key={suggestionVideo._id}
              whileHover={{ scale: 1.02 }}
              onClick={() => navigate(`/watch/${suggestionVideo._id}`)}
              className="cursor-pointer bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition-colors"
            >
              <div className="flex gap-3">
                <div className="relative w-32 h-20 flex-shrink-0 bg-slate-700 rounded overflow-hidden">
                  <img
                    src={suggestionVideo.thumbnail}
                    alt={suggestionVideo.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 p-2">
                  <h4 className="text-sm font-medium text-white line-clamp-2">
                    {suggestionVideo.title}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1">
                    {suggestionVideo.channel?.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {(suggestionVideo.views / 1000).toFixed(0)}K views
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
};
