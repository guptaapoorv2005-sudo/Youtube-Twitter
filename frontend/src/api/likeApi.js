import api from './axios';

export const toggleVideoLike = async (videoId) => {
  const { data } = await api.post(`/likes/video/${videoId}`);
  return data.data; // { liked: true/false }
};

export const toggleCommentLike = async (commentId) => {
  const { data } = await api.post(`/likes/comment/${commentId}`);
  return data.data; // { liked: true/false }
};

export const toggleTweetLike = async (tweetId) => {
  const { data } = await api.post(`/likes/tweet/${tweetId}`);
  return data.data; // { liked: true/false }
};

export const getLikedVideos = async ({ cursor, limit = 12 } = {}) => {
  const params = { limit };
  if (cursor) params.cursor = cursor;
  const { data } = await api.get('/likes', { params });
  return data.data; // { likedVideos, nextCursor, hasMore }
};
