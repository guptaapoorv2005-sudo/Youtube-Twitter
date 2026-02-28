import api from './axios';

export const toggleSubscription = async (channelId) => {
  const { data } = await api.post(`/subscriptions/toggle/${channelId}`);
  return data.data; // { subscribed: true/false }
};

export const getUserChannelSubscribers = async (channelId) => {
  const { data } = await api.get(`/subscriptions/get-subscribers/${channelId}`);
  return data.data; // Array of { subscriber: { fullName, username, avatar } }
};

export const getSubscribedChannels = async (subscriberId) => {
  const { data } = await api.get(`/subscriptions/get-subscribed-channels/${subscriberId}`);
  return data.data; // Array of { channel: { username, fullName, avatar } }
};
