import api from './axios';

export const createTweet = async (content) => {
  const { data } = await api.post('/tweets', { content });
  return data.data;
};

/**
 * Fetch tweets with cursor-based pagination.
 * @param {Object} options
 * @param {string} [options.userId]  - Filter by user (omit for global feed)
 * @param {number} [options.limit=10] - Items per page (max 50)
 * @param {string} [options.cursor]  - ISO date string for next page
 * @returns {{ tweets: Array, nextCursor: string|null }}
 */
export const getAllTweets = async ({ userId, limit = 10, cursor } = {}) => {
  const params = { limit };
  if (userId) params.userId = userId;
  if (cursor) params.cursor = cursor;
  const { data } = await api.get('/tweets/allTweets', { params });
  return data.data; // { tweets, nextCursor }
};

export const updateTweet = async (tweetId, content) => {
  const { data } = await api.patch(`/tweets/${tweetId}`, { content });
  return data.data;
};

export const deleteTweet = async (tweetId) => {
  const { data } = await api.delete(`/tweets/${tweetId}`);
  return data.data;
};
