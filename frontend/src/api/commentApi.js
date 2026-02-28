import api from './axios';

export const getVideoComments = async (videoId, { page = 1, limit = 10 } = {}) => {
  const { data } = await api.get(`/comments/video/${videoId}`, { params: { page, limit } });
  return data.data; // Paginated comments with owner
};

export const addComment = async (videoId, content) => {
  const { data } = await api.post(`/comments/video/${videoId}`, { content });
  return data.data;
};

export const updateComment = async (commentId, content) => {
  const { data } = await api.patch(`/comments/${commentId}`, { content });
  return data.data;
};

export const deleteComment = async (commentId) => {
  const { data } = await api.delete(`/comments/${commentId}`);
  return data.data;
};
