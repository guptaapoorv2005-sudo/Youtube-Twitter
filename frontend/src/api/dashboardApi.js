import api from './axios';

export const getChannelVideos = async ({ channelId, sortBy = 'createdAt', sortType = 'desc', cursor, limit = 10 } = {}) => {
  const params = { channelId, sortBy, sortType, limit };
  if (cursor) params.cursor = typeof cursor === 'object' ? JSON.stringify(cursor) : cursor;
  const { data } = await api.get('/dashboard/get-channel-videos', { params });
  return data.data; // { videos, nextCursor, hasMore }
};

export const getChannelStats = async (channelId) => {
  const { data } = await api.get(`/dashboard/${channelId}`);
  return data.data; // { videosCount, likes, views, totalSubscribers }
};
