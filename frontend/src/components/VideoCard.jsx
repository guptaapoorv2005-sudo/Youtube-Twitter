import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ThumbsUp, MessageCircle } from 'lucide-react';
import { formatDuration, timeAgo, formatViews } from '../utils/formatters';
import Avatar from './ui/Avatar';

export default function VideoCard({ video }) {
  const owner = video.owner || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link to={`/watch/${video._id}`} className="block">
        {/* Thumbnail */}
        <div className="relative mb-3 overflow-hidden rounded-xl aspect-video bg-dark-800">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
          {/* Duration badge */}
          {video.duration != null && (
            <span className="absolute bottom-2 right-2 rounded-md bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
              {formatDuration(video.duration)}
            </span>
          )}
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-linear-to-t from-black/30 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        </div>

        {/* Info */}
        <div className="flex gap-3">
          {owner.avatar && (
            <Link to={`/channel/${owner.username}`} onClick={(e) => e.stopPropagation()}>
              <Avatar src={owner.avatar} alt={owner.fullName} size="sm" />
            </Link>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-sm font-medium leading-snug text-dark-100 group-hover:text-accent-400 transition-colors">
              {video.title}
            </h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-dark-400">
              {owner.fullName && (
                <span className="hover:text-dark-200 transition-colors">{owner.fullName}</span>
              )}
              {video.views != null && (
                <>
                  <span>·</span>
                  <span>{formatViews(video.views)} views</span>
                </>
              )}
              {video.likesCount != null && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <ThumbsUp className="h-3 w-3" />
                    {formatViews(video.likesCount)}
                  </span>
                </>
              )}
              {video.commentsCount != null && (
                <>
                  <span>·</span>
                  <span className="flex items-center gap-0.5">
                    <MessageCircle className="h-3 w-3" />
                    {video.commentsCount}
                  </span>
                </>
              )}
              {video.createdAt && (
                <>
                  <span>·</span>
                  <span>{timeAgo(video.createdAt)}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
