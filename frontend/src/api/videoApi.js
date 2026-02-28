import api from './axios';

export const getAllVideos = async ({ page = 1, limit = 10, query, sortBy = 'createdAt', sortType = 'desc', userId } = {}) => {
  const params = { page, limit, sortBy, sortType };
  if (query) params.query = query;
  if (userId) params.userId = userId;
  const { data } = await api.get('/videos', { params });
  return data.data; // Paginated: { docs, totalDocs, page, totalPages, limit, ... }
};

export const getVideoById = async (videoId) => {
  const { data } = await api.get(`/videos/${videoId}`);
  return data.data;
};

export const publishVideo = async (formData) => {
  // formData: videoFile, thumbnail, title, description
  const { data } = await api.post('/videos', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const updateVideo = async (videoId, formData) => {
  // formData may include: thumbnail(file), title, description
  const { data } = await api.patch(`/videos/${videoId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const deleteVideo = async (videoId) => {
  const { data } = await api.delete(`/videos/${videoId}`);
  return data.data;
};

export const togglePublishStatus = async (videoId) => {
  const { data } = await api.patch(`/videos/toggle/publish/${videoId}`);
  return data.data;
};

// TODO: Backend controller required: PATCH /api/v1/videos/:videoId/view
// Increment view count for a video. Currently no endpoint exists.
export const incrementVideoView = async (videoId) => {
  // TODO: Implement backend controller for this endpoint
  console.warn(`[STUB] incrementVideoView(${videoId}) - backend controller not implemented`);
};
