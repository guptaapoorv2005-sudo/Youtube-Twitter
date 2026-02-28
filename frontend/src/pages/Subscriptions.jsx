import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserCheck } from 'lucide-react';
import { getSubscribedChannels } from '../api/subscriptionApi';
import { useAuth } from '../hooks/useAuth';
import Avatar from '../components/ui/Avatar';
import { Skeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import ErrorState from '../components/ui/ErrorState';

export default function Subscriptions() {
  const { user } = useAuth();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, hasNextPage: false, hasPrevPage: false });

  useEffect(() => {
    const fetch = async () => {
      if (!user?._id) return;
      try {
        setLoading(true);
        const data = await getSubscribedChannels(user._id, page, 10);
        const docs = Array.isArray(data?.docs) ? data.docs : [];
        const mapped = docs.map((item) => item.channel).filter(Boolean);
        setChannels(mapped);
        setPagination({
          totalPages: data?.totalPages || 1,
          hasNextPage: data?.hasNextPage || false,
          hasPrevPage: data?.hasPrevPage || false,
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load subscriptions');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user?._id, page]);

  return (
    <div className="mx-auto max-w-4xl">
      <motion.h1
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 text-2xl font-bold text-dark-100"
      >
        Subscriptions
      </motion.h1>

      {error ? (
        <ErrorState message={error} />
      ) : loading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-dark-800 bg-dark-900 p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : channels.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No subscriptions"
          description="Subscribe to channels to see them here"
        />
      ) : (
        <div className="space-y-3">
          {channels.map((ch) => (
            <motion.div
              key={ch._id || ch.username}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.01 }}
            >
              <Link
                to={`/channel/${ch.username}`}
                className="flex items-center gap-4 rounded-xl border border-dark-800 bg-dark-900 p-4 transition-colors hover:border-dark-700 hover:bg-dark-800/50"
              >
                <Avatar src={ch.avatar} alt={ch.fullName} size="lg" />
                <div className="min-w-0 flex-1">
                  <h3 className="font-medium text-dark-100">{ch.fullName}</h3>
                  <p className="text-sm text-dark-400">@{ch.username}</p>
                </div>
                <UserCheck className="h-5 w-5 text-accent-400" />
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && channels.length > 0 && (pagination.hasPrevPage || pagination.hasNextPage) && (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrevPage}
            className="rounded-lg border border-dark-700 bg-dark-900 px-4 py-2 text-sm font-medium text-dark-100 transition-colors hover:bg-dark-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-dark-400">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasNextPage}
            className="rounded-lg border border-dark-700 bg-dark-900 px-4 py-2 text-sm font-medium text-dark-100 transition-colors hover:bg-dark-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
