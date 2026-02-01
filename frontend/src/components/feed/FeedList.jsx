import { motion } from 'framer-motion';
import { PostCard } from './PostCard';

export const FeedList = ({ posts, isLoading, onLike, onComment, onLoadMore }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-4"
    >
      {posts.map((post) => (
        <PostCard key={post._id} post={post} onLike={onLike} onComment={onComment} />
      ))}

      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-slate-800 rounded-lg h-40 animate-pulse" />
          ))}
        </div>
      )}

      {posts.length === 0 && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-slate-400">No posts yet. Follow some users to see their posts!</p>
        </motion.div>
      )}

      {posts.length > 0 && !isLoading && (
        <div className="flex justify-center py-8">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLoadMore}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Load More
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};
