import api from './axios';

export const createPlaylist = async ({ name, description }) => {
  const { data } = await api.post('/playlists/create-playlist', { name, description });
  return data.data;
};

export const getUserPlaylists = async (userId, { limit = 10, cursor } = {}) => {
  const params = { userId, limit };
  if (cursor) params.cursor = cursor;
  const { data } = await api.get('/playlists/get-user-playlists', { params });
  return data.data; // { playlists, nextCursor }
};

export const getPlaylistById = async (playlistId) => {
  const { data } = await api.get(`/playlists/${playlistId}`);
  return data.data;
};

export const updatePlaylist = async (playlistId, { name, description }) => {
  const { data } = await api.patch(`/playlists/${playlistId}`, { name, description });
  return data.data;
};

export const deletePlaylist = async (playlistId) => {
  const { data } = await api.delete(`/playlists/${playlistId}`);
  return data.data;
};

export const addVideoToPlaylist = async (playlistId, videoId) => {
  const { data } = await api.post(`/playlists/add-video/${playlistId}/${videoId}`);
  return data.data;
};

export const removeVideoFromPlaylist = async (playlistId, videoId) => {
  const { data } = await api.patch(`/playlists/remove-video/${playlistId}/${videoId}`);
  return data.data;
};

export const togglePlaylistPublicStatus = async (playlistId) => {
  const { data } = await api.patch(`/playlists/toggle-public-status/${playlistId}`);
  return data.data;
};
