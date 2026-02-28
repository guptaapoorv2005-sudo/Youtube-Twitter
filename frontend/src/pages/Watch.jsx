import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ThumbsUp,
  Share2,
  ListPlus,
  Send,
  ChevronDown,
  ChevronUp,
  Check,
  Trash2,
} from 'lucide-react';
import { getVideoById, incrementVideoView, deleteVideo } from '../api/videoApi';
import { addToWatchHistory } from '../api/watchHistoryApi';
import { getVideoComments, addComment } from '../api/commentApi';
import { toggleVideoLike } from '../api/likeApi';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import CommentCard from '../components/CommentCard';
import { Skeleton, CommentSkeleton } from '../components/ui/Skeleton';
import ErrorState from '../components/ui/ErrorState';
import EmptyState from '../components/ui/EmptyState';
import SaveToPlaylistModal from '../components/SaveToPlaylistModal';
import { timeAgo, formatViews } from '../utils/formatters';

export default function Watch() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);

  // Comments
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [commentPage, setCommentPage] = useState(1);
  const [hasMoreComments, setHasMoreComments] = useState(true);
  const [showDescription, setShowDescription] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchVideo = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getVideoById(videoId);
      setVideo(data);
      setLiked(data.likedStatus ?? false);
      setLikesCount(data.likesCount ?? 0);
      // Increment view count + add to watch history (fire-and-forget)
      incrementVideoView(videoId).catch(() => {});
      addToWatchHistory(videoId).catch(() => {});
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load video');
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  const fetchComments = useCallback(async (page = 1, append = false) => {
    try {
      setCommentsLoading(true);
      const data = await getVideoComments(videoId, { page, limit: 15 });
      const docs = data.docs || [];
      setComments((prev) => (append ? [...prev, ...docs] : docs));
      setHasMoreComments(page < (data.totalPages || 1));
    } catch (err) {
      console.error('Fetch comments failed:', err);
    } finally {
      setCommentsLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchVideo();
    fetchComments(1);
  }, [fetchVideo, fetchComments]);

  const handleLike = async () => {
    try {
      const result = await toggleVideoLike(videoId);
      const nowLiked = result.liked;
      setLiked(nowLiked);
      setLikesCount((prev) => prev + (nowLiked ? 1 : -1));
    } catch (err) {
      console.error('Like failed:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this video? This action cannot be undone.')) return;
    try {
      setDeleting(true);
      await deleteVideo(videoId);
    } catch (err) {
      console.error('Delete failed:', err);
      setDeleting(false);
      return;
    }
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/', { replace: true });
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const newComment = await addComment(videoId, commentText.trim());
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
    } catch (err) {
      console.error('Add comment failed:', err);
    }
  };

  const handleCommentDelete = (commentId) => {
    setComments((prev) => prev.filter((c) => c._id !== commentId));
  };

  const handleCommentUpdate = (updated) => {
    setComments((prev) => prev.map((c) => (c._id === updated._id ? { ...c, content: updated.content } : c)));
  };

  const loadMoreComments = () => {
    const next = commentPage + 1;
    setCommentPage(next);
    fetchComments(next, true);
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="space-y-4">
            <Skeleton className="aspect-video w-full rounded-2xl" />
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
        </div>
      </div>
    );
  }

  if (error) {
    return <ErrorState message={error} onRetry={fetchVideo} />;
  }

  if (!video) return null;

  const owner = video.owner || {};

  return (
    <div className="mx-auto max-w-4xl">
        <div className="space-y-4">
          {/* Video player */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative overflow-hidden rounded-2xl bg-black aspect-video"
          >
            <video
              src={video.videoFile}
              controls
              autoPlay
              className="h-full w-full"
              poster={video.thumbnail}
            />
          </motion.div>

          {/* Title */}
          <h1 className="text-xl font-bold text-dark-100 leading-tight">{video.title}</h1>

          {/* Channel info + Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Link to={`/channel/${owner.username}`}>
                <Avatar src={owner.avatar} alt={owner.fullName} size="md" />
              </Link>
              <div>
                <Link
                  to={`/channel/${owner.username}`}
                  className="text-sm font-semibold text-dark-100 hover:text-accent-400 transition-colors"
                >
                  {owner.fullName}
                </Link>
                <p className="text-xs text-dark-400">@{owner.username}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-xl border border-dark-700">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 px-4 py-2 text-sm transition-colors ${
                    liked
                      ? 'bg-accent-500/15 text-accent-400'
                      : 'text-dark-300 hover:bg-dark-800'
                  }`}
                >
                  <ThumbsUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                  {likesCount > 0 && <span>{likesCount}</span>}
                </button>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="flex items-center gap-1.5 rounded-xl border border-dark-700 px-4 py-2 text-sm text-dark-300 hover:bg-dark-800 transition-colors"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Share2 className="h-4 w-4" />}
                {copied ? 'Copied!' : 'Share'}
              </button>
              <button
                onClick={() => setShowPlaylistModal(true)}
                className="flex items-center gap-1.5 rounded-xl border border-dark-700 px-4 py-2 text-sm text-dark-300 hover:bg-dark-800 transition-colors"
              >
                <ListPlus className="h-4 w-4" />
                Save
              </button>
              {user && owner._id === user._id && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex items-center gap-1.5 rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-xl bg-dark-900 p-4">
            <div className="flex items-center gap-3 text-sm text-dark-300">
              {video.views != null && <span className="font-medium">{formatViews(video.views)} views</span>}
              <span>{timeAgo(video.createdAt)}</span>
            </div>
            {video.description && (
              <>
                <p className={`mt-2 text-sm text-dark-200 whitespace-pre-wrap ${!showDescription ? 'line-clamp-3' : ''}`}>
                  {video.description}
                </p>
                {video.description.length > 200 && (
                  <button
                    onClick={() => setShowDescription(!showDescription)}
                    className="mt-1 flex items-center gap-1 text-xs font-medium text-dark-400 hover:text-dark-200"
                  >
                    {showDescription ? (
                      <>Show less <ChevronUp className="h-3 w-3" /></>
                    ) : (
                      <>Show more <ChevronDown className="h-3 w-3" /></>
                    )}
                  </button>
                )}
              </>
            )}
          </div>

          {/* Comments section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-dark-100">Comments</h3>

            {/* Add comment */}
            <div className="flex gap-3">
              <Avatar src={user?.avatar} alt={user?.fullName} size="sm" />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                  className="w-full rounded-xl border border-dark-700 bg-dark-800 px-4 py-2.5 text-sm text-dark-100 placeholder-dark-500 outline-none transition-colors focus:border-accent-500"
                />
                {commentText.trim() && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 flex justify-end">
                    <Button variant="brand" size="sm" onClick={handleAddComment}>
                      <Send className="h-3.5 w-3.5" />
                      Comment
                    </Button>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Comments list */}
            <div className="divide-y divide-dark-800">
              <AnimatePresence>
                {commentsLoading && comments.length === 0
                  ? Array.from({ length: 4 }).map((_, i) => <CommentSkeleton key={i} />)
                  : comments.map((comment) => (
                      <CommentCard
                        key={comment._id}
                        comment={comment}
                        onDelete={handleCommentDelete}
                        onUpdate={handleCommentUpdate}
                      />
                    ))}
              </AnimatePresence>
            </div>

            {comments.length === 0 && !commentsLoading && (
              <EmptyState title="No comments yet" description="Be the first to comment!" />
            )}

            {hasMoreComments && comments.length > 0 && (
              <div className="flex justify-center">
                <Button variant="ghost" size="sm" onClick={loadMoreComments} loading={commentsLoading}>
                  Load more comments
                </Button>
              </div>
            )}
          </div>
        </div>

      <SaveToPlaylistModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        videoId={videoId}
      />
    </div>
  );
}
