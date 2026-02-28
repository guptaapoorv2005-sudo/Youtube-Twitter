import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2, Edit3, MoreHorizontal, X, Check } from 'lucide-react';
import Avatar from './ui/Avatar';
import { timeAgo } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import { toggleTweetLike } from '../api/likeApi';
import { deleteTweet, updateTweet } from '../api/tweetApi';

export default function TweetCard({ tweet, onDelete, onUpdate }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(tweet.likedStatus ?? false);
  const [likesCount, setLikesCount] = useState(tweet.likesCount ?? 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(tweet.content);
  const [likeLoading, setLikeLoading] = useState(false);

  // Use editableStatus from backend when available, fall back to manual check
  const isOwner = tweet.editableStatus ?? (user?._id === tweet.owner?._id || user?._id === tweet.owner);
  const ownerData = typeof tweet.owner === 'object' ? tweet.owner : null;

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const result = await toggleTweetLike(tweet._id);
      const nowLiked = result.liked;
      setLiked(nowLiked);
      setLikesCount((prev) => prev + (nowLiked ? 1 : -1));
    } catch (err) {
      console.error('Like failed:', err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteTweet(tweet._id);
      onDelete?.(tweet._id);
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setMenuOpen(false);
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      const updated = await updateTweet(tweet._id, editContent.trim());
      onUpdate?.(updated);
      setEditing(false);
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="rounded-2xl border border-dark-800 bg-dark-900 p-5 transition-colors hover:border-dark-700"
    >
      <div className="flex gap-3">
        {/* Avatar */}
        {ownerData ? (
          <Link to={`/channel/${ownerData.username}`}>
            <Avatar src={ownerData.avatar} alt={ownerData.fullName} size="md" />
          </Link>
        ) : (
          <Avatar alt="?" size="md" />
        )}

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              {ownerData && (
                <Link to={`/channel/${ownerData.username}`} className="text-sm font-semibold text-dark-100 hover:text-accent-400 transition-colors">
                  {ownerData.fullName}
                </Link>
              )}
              <span className="text-xs text-dark-500">{timeAgo(tweet.createdAt)}</span>
            </div>

            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="rounded-lg p-1 text-dark-400 hover:bg-dark-800 hover:text-dark-200 transition-colors"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute right-0 top-8 z-10 w-36 rounded-xl border border-dark-700 bg-dark-800 py-1 shadow-xl"
                  >
                    <button
                      onClick={() => { setEditing(true); setMenuOpen(false); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-dark-200 hover:bg-dark-700"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-dark-700"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Delete
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {editing ? (
            <div className="mt-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full resize-none rounded-xl border border-dark-600 bg-dark-800 p-3 text-sm text-dark-100 outline-none focus:border-accent-500"
                rows={3}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="flex items-center gap-1 rounded-lg bg-accent-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-accent-600"
                >
                  <Check className="h-3.5 w-3.5" /> Save
                </button>
                <button
                  onClick={() => { setEditing(false); setEditContent(tweet.content); }}
                  className="flex items-center gap-1 rounded-lg bg-dark-700 px-3 py-1.5 text-xs text-dark-300 hover:bg-dark-600"
                >
                  <X className="h-3.5 w-3.5" /> Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-dark-200">{tweet.content}</p>
          )}

          {/* Actions */}
          <div className="mt-3 flex gap-3">
            <button
              onClick={handleLike}
              disabled={likeLoading}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                liked
                  ? 'bg-brand-500/15 text-brand-400'
                  : 'bg-dark-800 text-dark-400 hover:bg-dark-700 hover:text-dark-200'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${liked ? 'fill-current' : ''}`} />
              {likesCount > 0 ? likesCount : ''} {liked ? 'Liked' : 'Like'}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
