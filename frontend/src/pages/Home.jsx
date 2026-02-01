import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { postsAPI } from '../services/api';
import { FeedList } from '../components/feed/FeedList';
import { CreatePostCard } from '../components/feed/CreatePostCard';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/EmptyState';
import { AlertCircle } from 'lucide-react';

export const Home = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await postsAPI.getFeed(page, 10);
      if (page === 1) {
        setPosts(response.data.data);
      } else {
        setPosts((prev) => [...prev, ...response.data.data]);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load feed');
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (postId, isLiked) => {
    try {
      if (isLiked) {
        await postsAPI.likePost(postId);
      } else {
        await postsAPI.unlikePost(postId);
      }
    } catch (err) {
      console.error('Like error:', err);
    }
  };

  const handleCreatePost = async (content) => {
    try {
      const response = await postsAPI.createPost(content);
      setPosts((prev) => [response.data.data, ...prev]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create post');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      {/* Create Post */}
      {user && <CreatePostCard user={user} onSubmit={handleCreatePost} isLoading={loading} />}

      {/* Error State */}
      {error && (
        <ErrorState
          title="Oops! Something went wrong"
          description={error}
          onRetry={() => {
            setPage(1);
            fetchPosts();
          }}
          icon={AlertCircle}
        />
      )}

      {/* Loading */}
      {loading && page === 1 && <Loader />}

      {/* Feed */}
      {!loading && !error && (
        <FeedList
          posts={posts}
          isLoading={false}
          onLike={handleLike}
          onComment={(postId) => console.log('Comment on', postId)}
          onLoadMore={() => setPage((prev) => prev + 1)}
        />
      )}
    </motion.div>
  );
};
