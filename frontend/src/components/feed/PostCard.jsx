import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { Card, CardBody } from '../ui/Card';
import { IconButton } from '../ui/Button';

export const PostCard = ({ post, onLike, onComment }) => {
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [likeCount, setLikeCount] = useState(post.likes || 0);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike?.(post._id, !isLiked);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="mb-4">
        <CardBody className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <img
                src={post.author?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                alt={post.author?.username}
                className="w-10 h-10 rounded-full"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white text-sm">{post.author?.username}</h3>
                <p className="text-slate-400 text-xs">@{post.author?.username}</p>
                <p className="text-slate-500 text-xs mt-1">{formatTime(post.createdAt)}</p>
              </div>
            </div>
            <IconButton icon={MoreHorizontal} className="text-slate-400" />
          </div>

          {/* Content */}
          <p className="text-slate-200 text-sm mb-3 leading-relaxed">{post.content}</p>

          {/* Media */}
          {post.images && post.images.length > 0 && (
            <div className="mb-3 rounded-lg overflow-hidden">
              {post.images.length === 1 ? (
                <img src={post.images[0]} alt="post" className="w-full h-auto" />
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {post.images.map((img, idx) => (
                    <img key={idx} src={img} alt={`post-${idx}`} className="w-full h-40 object-cover" />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="flex gap-4 text-xs text-slate-400 py-2 border-y border-slate-700 mb-3">
            <span>{post.comments || 0} replies</span>
            <span>{likeCount} likes</span>
            <span>{post.shares || 0} shares</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-around">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => onComment?.(post._id)}
              className="flex items-center gap-2 text-slate-400 hover:text-blue-400 transition-colors py-2 px-4 rounded hover:bg-blue-500/10"
            >
              <MessageCircle size={16} />
              <span className="text-xs hidden sm:inline">Reply</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              className="flex items-center gap-2 text-slate-400 hover:text-green-400 transition-colors py-2 px-4 rounded hover:bg-green-500/10"
            >
              <Share2 size={16} />
              <span className="text-xs hidden sm:inline">Share</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={handleLike}
              className={`flex items-center gap-2 transition-colors py-2 px-4 rounded ${
                isLiked
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-slate-400 hover:text-red-500 hover:bg-red-500/10'
              }`}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              <span className="text-xs hidden sm:inline">Like</span>
            </motion.button>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

const formatTime = (date) => {
  const now = new Date();
  const postDate = new Date(date);
  const diffMs = now - postDate;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'now';
  if (diffMins < 60) return `${diffMins}m`;
  if (diffHours < 24) return `${diffHours}h`;
  if (diffDays < 7) return `${diffDays}d`;
  return postDate.toLocaleDateString();
};
