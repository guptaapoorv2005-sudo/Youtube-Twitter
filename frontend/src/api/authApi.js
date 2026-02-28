import api from './axios';

export const registerUser = async (formData) => {
  // formData should be a FormData object with: username, email, password, fullName, avatar, coverImage(optional)
  const { data } = await api.post('/users/register', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const loginUser = async ({ username, email, password }) => {
  const { data } = await api.post('/users/login', { username, email, password });
  return data.data; // { user, accessToken, refreshToken }
};

export const logoutUser = async () => {
  const { data } = await api.post('/users/logout');
  return data.data;
};

export const refreshToken = async () => {
  const { data } = await api.post('/users/refresh-token');
  return data.data;
};

export const getCurrentUser = async () => {
  const { data } = await api.get('/users/current-user');
  return data.data;
};
