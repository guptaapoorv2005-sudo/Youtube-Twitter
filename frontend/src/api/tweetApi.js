import api from './axios';

export const createTweet = async (content) => {
  const { data } = await api.post('/tweets', { content });
  return data.data;
};

export const getUserTweets = async (userId) => {
  const { data } = await api.get(`/tweets/user/${userId}`);
  return data.data; // Array of tweets
};

export const updateTweet = async (tweetId, content) => {
  const { data } = await api.patch(`/tweets/${tweetId}`, { content });
  return data.data;
};

export const deleteTweet = async (tweetId) => {
  const { data } = await api.delete(`/tweets/${tweetId}`);
  return data.data;
};

// TODO: Backend controller required: GET /api/v1/tweets?page=1&limit=10
// A "get all tweets" feed endpoint to show tweets from all users.
// Currently only getUserTweets (per user) exists.
export const getAllTweets = async ({ page = 1, limit = 20 } = {}) => {
  // TODO: Implement backend controller for this endpoint
  throw new Error('Backend controller not implemented yet: GET /api/v1/tweets (feed)');
};
