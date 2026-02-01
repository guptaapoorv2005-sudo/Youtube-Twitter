import { motion } from 'framer-motion';
import { Play, Heart, MessageCircle, Share2 } from 'lucide-react';
import { Card } from '../ui/Card';

export const VideoCard = ({ video, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      className="cursor-pointer group"
    >
      <Card hoverable>
        {/* Thumbnail */}
        <div className="relative overflow-hidden bg-slate-700 aspect-video">
          <img
            src={video.thumbnail}
            alt={video.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Play button overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            whileHover={{ opacity: 1, scale: 1 }}
            className="absolute inset-0 flex items-center justify-center bg-black/40"
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center"
            >
              <Play size={24} className="fill-white text-white ml-1" />
            </motion.div>
          </motion.div>

          {/* Duration */}
          <div className="absolute bottom-2 right-2 bg-black/75 px-2 py-1 rounded text-xs text-white font-medium">
            {formatDuration(video.duration)}
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-semibold text-white text-sm line-clamp-2 mb-2">{video.title}</h3>

          <div className="flex items-center gap-2 mb-2">
            <img
              src={video.channel?.avatar}
              alt={video.channel?.name}
              className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
              <p className="text-slate-300 text-xs font-medium truncate">{video.channel?.name}</p>
              <p className="text-slate-400 text-xs">{formatViews(video.views)} views</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-2 text-slate-400 text-xs">
            <Heart size={14} className={video.isLiked ? 'fill-red-500 text-red-500' : ''} />
            <span>{video.likes}</span>
            <MessageCircle size={14} />
            <span>{video.comments}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

const formatViews = (views) => {
  if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
  if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
  return views.toString();
};
