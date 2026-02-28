import api from './axios';

export const toggleSubscription = async (channelId) => {
  const { data } = await api.post(`/subscriptions/toggle/${channelId}`);
  return data.data; // { subscribed: true/false }
};

export const getUserChannelSubscribers = async (channelId, page = 1, limit = 10) => {
  const { data } = await api.get(`/subscriptions/get-subscribers/${channelId}`, {
    params: { page, limit }
  });
  return data.data; // { docs: [{ subscriber: { fullName, username, avatar } }], totalDocs, page, totalPages, ... }
};

export const getSubscribedChannels = async (subscriberId, page = 1, limit = 10) => {
  const { data } = await api.get(`/subscriptions/get-subscribed-channels/${subscriberId}`, {
    params: { page, limit }
  });
  return data.data; // { docs: [{ channel: { username, fullName, avatar } }], totalDocs, page, totalPages, ... }
};
