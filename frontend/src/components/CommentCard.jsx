import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, Trash2, Edit3, MoreHorizontal, X, Check } from 'lucide-react';
import Avatar from './ui/Avatar';
import { timeAgo } from '../utils/formatters';
import { useAuth } from '../hooks/useAuth';
import { toggleCommentLike } from '../api/likeApi';
import { deleteComment, updateComment } from '../api/commentApi';

export default function CommentCard({ comment, onDelete, onUpdate }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);

  const isOwner = user?._id === (comment.owner?._id || comment.owner);
  const owner = typeof comment.owner === 'object' ? comment.owner : null;

  const handleLike = async () => {
    try {
      const result = await toggleCommentLike(comment._id);
      setLiked(result.liked);
    } catch (err) {
      console.error('Comment like failed:', err);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteComment(comment._id);
      onDelete?.(comment._id);
    } catch (err) {
      console.error('Comment delete failed:', err);
    }
    setMenuOpen(false);
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    try {
      const updated = await updateComment(comment._id, editContent.trim());
      onUpdate?.(updated);
      setEditing(false);
    } catch (err) {
      console.error('Comment update failed:', err);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 py-3"
    >
      {owner ? (
        <Link to={`/channel/${owner.username}`}>
          <Avatar src={owner.avatar} alt={owner.fullName} size="sm" />
        </Link>
      ) : (
        <Avatar alt="?" size="sm" />
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {owner && (
              <Link to={`/channel/${owner.username}`} className="text-xs font-semibold text-dark-200 hover:text-accent-400 transition-colors">
                @{owner.username}
              </Link>
            )}
            <span className="text-xs text-dark-500">{timeAgo(comment.createdAt)}</span>
          </div>

          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="rounded p-0.5 text-dark-500 hover:text-dark-300"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
              {menuOpen && (
                <div className="absolute right-0 top-6 z-10 w-32 rounded-xl border border-dark-700 bg-dark-800 py-1 shadow-xl">
                  <button
                    onClick={() => { setEditing(true); setMenuOpen(false); }}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-dark-200 hover:bg-dark-700"
                  >
                    <Edit3 className="h-3 w-3" /> Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-3 py-1.5 text-xs text-red-400 hover:bg-dark-700"
                  >
                    <Trash2 className="h-3 w-3" /> Delete
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {editing ? (
          <div className="mt-1">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full resize-none rounded-lg border border-dark-600 bg-dark-800 p-2 text-sm text-dark-100 outline-none focus:border-accent-500"
              rows={2}
            />
            <div className="mt-1.5 flex gap-2">
              <button onClick={handleUpdate} className="flex items-center gap-1 rounded-lg bg-accent-500 px-2.5 py-1 text-xs text-white hover:bg-accent-600">
                <Check className="h-3 w-3" /> Save
              </button>
              <button onClick={() => { setEditing(false); setEditContent(comment.content); }} className="flex items-center gap-1 rounded-lg bg-dark-700 px-2.5 py-1 text-xs text-dark-300 hover:bg-dark-600">
                <X className="h-3 w-3" /> Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-1 text-sm text-dark-300">{comment.content}</p>
        )}

        <button
          onClick={handleLike}
          className={`mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
            liked ? 'text-brand-400' : 'text-dark-500 hover:text-dark-300'
          }`}
        >
          <Heart className={`h-3 w-3 ${liked ? 'fill-current' : ''}`} />
          {liked ? 'Liked' : 'Like'}
        </button>
      </div>
    </motion.div>
  );
}
