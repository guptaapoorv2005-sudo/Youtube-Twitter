import api from './axios';

/**
 * Fetch current user's watch history (page-based pagination).
 * @param {Object} options
 * @param {number} [options.page=1]
 * @param {number} [options.limit=10]
 * @returns {{ docs: Array<{ video, watchedAt }>, totalDocs, page, totalPages, limit }}
 */
export const getUserWatchHistory = async ({ page = 1, limit = 10 } = {}) => {
  const { data } = await api.get('/history', { params: { page, limit } });
  return data.data;
};

/**
 * Add a video to current user's watch history (upserts).
 * @param {string} videoId
 */
export const addToWatchHistory = async (videoId) => {
  const { data } = await api.post(`/history/${videoId}`);
  return data.data;
};

/**
 * Remove a video from current user's watch history.
 * @param {string} videoId
 */
export const removeFromWatchHistory = async (videoId) => {
  const { data } = await api.delete(`/history/${videoId}`);
  return data.data;
};
