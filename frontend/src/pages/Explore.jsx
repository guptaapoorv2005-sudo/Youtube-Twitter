import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { videosAPI } from '../services/api';
import { VideoCard } from '../components/video/VideoCard';
import { Loader } from '../components/common/Loader';
import { EmptyState } from '../components/common/EmptyState';
import { Video } from 'lucide-react';

export const Explore = ({ onVideoClick }) => {
  const [searchParams] = useSearchParams();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const searchQuery = searchParams.get('q') || '';

  const fetchVideos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await videosAPI.getVideos(page, 12);
      if (page === 1) {
        setVideos(response.data.data);
      } else {
        setVideos((prev) => [...prev, ...response.data.data]);
      }
    } catch (err) {
      console.error('Fetch videos error:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Search Query Title */}
      {searchQuery && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white">
            Search results for "<span className="text-blue-400">{searchQuery}</span>"
          </h1>
          <p className="text-slate-400 mt-2">
            Found {videos.length} video{videos.length !== 1 ? 's' : ''}
          </p>
        </motion.div>
      )}

      {/* Video Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8"
      >
        {videos.map((video) => (
          <VideoCard
            key={video._id}
            video={video}
            onClick={() => onVideoClick?.(video._id)}
          />
        ))}
      </motion.div>

      {/* Loading */}
      {loading && <Loader />}

      {/* Empty State */}
      {!loading && videos.length === 0 && (
        <EmptyState
          title="No videos found"
          description={
            searchQuery ? 'Try searching with different keywords' : 'No videos available'
          }
          icon={Video}
        />
      )}

      {/* Load More */}
      {videos.length > 0 && !loading && (
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setPage((prev) => prev + 1)}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Load More Videos
          </motion.button>
        </div>
      )}
    </motion.div>
  );
};
