import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardBody } from '../components/ui/Card';
import { Tabs } from '../components/ui/Tabs';
import { VideoCard } from '../components/video/VideoCard';
import { PostCard } from '../components/feed/PostCard';
import { Loader } from '../components/common/Loader';
import { ErrorState } from '../components/common/EmptyState';
import { Edit2, AlertCircle } from 'lucide-react';

export const Profile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        const [userRes, postsRes, videosRes] = await Promise.all([
          usersAPI.getUser(userId),
          usersAPI.getUserPosts(userId),
          usersAPI.getUserVideos(userId),
        ]);
        setUser(userRes.data.data);
        setPosts(postsRes.data.data);
        setVideos(videosRes.data.data);
        setIsFollowing(userRes.data.data.isFollowed || false);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load profile');
        console.error('Fetch profile error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  const handleFollow = async () => {
    try {
      if (isFollowing) {
        await usersAPI.unfollowUser(userId);
      } else {
        await usersAPI.followUser(userId);
      }
      setIsFollowing(!isFollowing);
    } catch (err) {
      console.error('Follow error:', err);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (error)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ErrorState
          title="Profile not found"
          description={error}
          onRetry={() => navigate('/')}
          icon={AlertCircle}
        />
      </div>
    );

  const tabContent = [
    {
      label: 'Posts',
      content: (
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post._id} post={post} />)
          ) : (
            <p className="text-slate-400 text-center py-8">No posts yet</p>
          )}
        </div>
      ),
    },
    {
      label: 'Videos',
      content: (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {videos.length > 0 ? (
            videos.map((video) => (
              <VideoCard
                key={video._id}
                video={video}
                onClick={() => navigate(`/watch/${video._id}`)}
              />
            ))
          ) : (
            <p className="col-span-full text-slate-400 text-center py-8">No videos yet</p>
          )}
        </motion.div>
      ),
    },
    {
      label: `Likes (${user?.likedPostsCount || 0})`,
      content: <p className="text-slate-400 text-center py-8">Liked content coming soon</p>,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="min-h-screen">
      {/* Cover Image */}
      <div className="h-48 sm:h-64 bg-gradient-to-r from-blue-500 to-purple-600" />

      {/* Profile Info */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative -mt-20 mb-8"
        >
          <Card className="bg-slate-800">
            <CardBody>
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-end">
                {/* Avatar */}
                <motion.img
                  whileHover={{ scale: 1.05 }}
                  src={user?.avatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'}
                  alt={user?.username}
                  className="w-32 h-32 rounded-full border-4 border-slate-800 sm:border-slate-700"
                />

                {/* Info */}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-white">{user?.username}</h1>
                  <p className="text-slate-400 mb-4">@{user?.username}</p>
                  <p className="text-slate-300 mb-4 max-w-2xl">{user?.bio}</p>

                  {/* Stats */}
                  <div className="flex gap-6 mb-4">
                    <div>
                      <p className="text-xl font-bold text-white">{user?.followersCount || 0}</p>
                      <p className="text-slate-400 text-sm">Followers</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">{user?.followingCount || 0}</p>
                      <p className="text-slate-400 text-sm">Following</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-white">
                        {posts.length + videos.length}
                      </p>
                      <p className="text-slate-400 text-sm">Posts & Videos</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant={isFollowing ? 'secondary' : 'primary'}
                    onClick={handleFollow}
                  >
                    {isFollowing ? 'Unfollow' : 'Follow'}
                  </Button>
                  <Button variant="ghost" icon={Edit2}>
                    <Edit2 size={18} />
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs tabs={tabContent} defaultTab={0} onChange={setActiveTab} />
        </motion.div>
      </div>
    </motion.div>
  );
};
