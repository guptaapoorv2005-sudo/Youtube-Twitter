import { motion } from 'framer-motion';
import { Heart, MessageCircle, Share2, Eye } from 'lucide-react';
import { Card, CardBody } from '../ui/Card';
import { IconButton } from '../ui/Button';
import { useState } from 'react';

export const VideoDetailCard = ({ video, onLike, onComment, onSubscribe, isSubscribed }) => {
  const [isLiked, setIsLiked] = useState(video.isLiked || false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.();
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardBody className="p-4">
          {/* Title */}
          <h1 className="text-2xl font-bold text-white mb-2">{video.title}</h1>

          {/* Meta info */}
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <img
                src={video.channel?.avatar}
                alt={video.channel?.name}
                className="w-12 h-12 rounded-full"
              />
              <div>
                <h3 className="font-semibold text-white">{video.channel?.name}</h3>
                <p className="text-slate-400 text-sm">{formatNumber(video.channel?.subscribers)} subscribers</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSubscribe}
              className={`px-6 py-2 rounded-full font-semibold transition-colors ${
                isSubscribed
                  ? 'bg-slate-700 text-white hover:bg-slate-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isSubscribed ? 'Subscribed' : 'Subscribe'}
            </motion.button>
          </div>

          {/* Description */}
          <div className="mb-4">
            <p className="text-slate-300 text-sm leading-relaxed">{video.description}</p>
          </div>

          {/* Stats and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6 text-slate-400 text-sm">
              <div className="flex items-center gap-2">
                <Eye size={16} />
                <span>{formatNumber(video.views)} views</span>
              </div>
              <span>{new Date(video.createdAt).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  isLiked
                    ? 'text-red-500 bg-red-500/10'
                    : 'text-slate-400 hover:text-red-500 hover:bg-red-500/10'
                }`}
              >
                <Heart size={18} fill={isLiked ? 'currentColor' : 'none'} />
                <span className="text-sm">{video.likes}</span>
              </motion.button>

              <IconButton
                icon={MessageCircle}
                onClick={onComment}
                className="text-slate-400 hover:text-blue-400"
              />
              <IconButton icon={Share2} className="text-slate-400 hover:text-green-400" />
            </div>
          </div>
        </CardBody>
      </Card>
    </motion.div>
  );
};

const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};
