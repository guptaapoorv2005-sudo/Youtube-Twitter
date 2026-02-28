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

export const getLikedVideos = async () => {
  const { data } = await api.get('/likes');
  return data.data; // Array of { video: { thumbnail, owner, title, duration } }
};

// TODO: Backend controller required: GET /api/v1/likes/status/:entityType/:entityId
// Check if current user has liked a video/tweet/comment without toggling.
export const getLikeStatus = async (entityType, entityId) => {
  // TODO: Implement backend controller for this endpoint
  throw new Error(`Backend controller not implemented yet: GET /api/v1/likes/status/${entityType}/${entityId}`);
};

// TODO: Backend controller required: GET /api/v1/likes/count/:entityType/:entityId
// Get the total like count for a specific entity.
export const getLikesCount = async (entityType, entityId) => {
  // TODO: Implement backend controller for this endpoint
  throw new Error(`Backend controller not implemented yet: GET /api/v1/likes/count/${entityType}/${entityId}`);
};
