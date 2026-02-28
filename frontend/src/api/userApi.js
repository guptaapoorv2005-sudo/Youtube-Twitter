import api from './axios';

export const changePassword = async ({ oldPassword, newPassword }) => {
  const { data } = await api.patch('/users/change-password', { oldPassword, newPassword });
  return data.data;
};

export const updateAccountDetails = async ({ fullName, email }) => {
  const { data } = await api.patch('/users/update-account', { fullName, email });
  return data.data;
};

export const updateUserAvatar = async (formData) => {
  const { data } = await api.patch('/users/update-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const updateUserCoverImage = async (formData) => {
  const { data } = await api.patch('/users/update-cover', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data.data;
};

export const getUserChannelProfile = async (username) => {
  const { data } = await api.get(`/users/channel/${username}`);
  return data.data;
};

export const deleteAccount = async () => {
  const { data } = await api.delete('/users/delete-account');
  return data.data;
};
