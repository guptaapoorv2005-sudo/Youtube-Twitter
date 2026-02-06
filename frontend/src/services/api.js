import axios from 'axios';
import { get } from 'mongoose';
import { toggleSubscription } from '../../../backend/src/controllers/subscription.controller';
import { updateComment } from '../../../backend/src/controllers/comment.controller';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL, //all requests use this url prefix
  withCredentials: true, //send cookies with requests
});

// Handle errors
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error);
    else resolve();
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config; //error.config is the exact Axios request configuration object that was used to make the request that just failed.

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          return api(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        await api.post("/users/refresh-token");

        isRefreshing = false;
        processQueue(null);

        return api(originalRequest);

      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


// Auth APIs
export const authAPI = {
  register: (userData, avatarFile, coverImageFile) => {
    const formData = new FormData(); //FormData is a browser API used when Uploading files

    formData.append("avatar", avatarFile); //the key 'avatar' should match the backend field name used in multer
    if(coverImageFile)formData.append("coverImage",coverImageFile);

    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });

    return api.post('/users/register', formData);
  },
  login: (userData) => api.post('/users/login', userData),
  logout: () => api.post('/users/logout'),
  getCurrentUser: () => api.get('/users/current-user'),
  changePassword: (passwordData) => api.patch('/users/change-password', passwordData),
  updateAccountDetails: (details) => api.patch('/users/update-account', details),
  updateAvatar: (avatarFile) => {
    const formData = new FormData();
    formData.append('avatar', avatarFile);

    return api.patch('/users/update-avatar', formData);
  },
  updateCoverImage: (coverImageFile) => {
    const formData = new FormData();
    formData.append('coverImage', coverImageFile);
    return api.patch('/users/update-cover', formData);
  },
  getUserChannelProfile: (username) => api.get(`/users/channel/${username}`),
  getWatchHistory: () => api.get('/users/history')
};

// Tweets APIs
export const tweetsAPI = {
  // getFeed: (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`),
  createTweet: (content) => api.post('/tweets', { content }),
  getUserTweets: (userId) => api.get(`/tweets/user/${userId}`),
  updateTweet: (tweetId, content) => api.patch(`/tweets/${tweetId}`, { content }),
  deleteTweet: (tweetId) => api.delete(`/tweets/${tweetId}`),
};

// Videos APIs
export const videosAPI = {
  getVideos: (page = 1, limit = 10, query = '', sortBy = 'createdAt', sortType = '', userId = '') => 
    api.get(`/videos?page=${page}&limit=${limit}&query=${query}&sortBy=${sortBy}&sortType=${sortType}&userId=${userId}`),
  getVideo: (videoId) => api.get(`/videos/${videoId}`),
  createVideo: (videoData, videoFile, thumbnailFile) => {
    const formData = new FormData();
    formData.append('videoFile', videoFile);
    formData.append('thumbnail', thumbnailFile);

    Object.keys(videoData).forEach(key => formData.append(key, videoData[key]))
    return api.post('/videos', formData);
  },
  updateVideo: (videoId, thumbnailFile, data) => {
    const formData = new FormData();
    formData.append('thumbnail', thumbnailFile);

    Object.keys(data).forEach(key => formData.append(key, data[key]))
    return api.patch(`/videos/${videoId}`, formData);
  },
  deleteVideo: (videoId) => api.delete(`/videos/${videoId}`),
  togglePublishStatus: (videoId) => api.patch(`/videos/toggle/publish/${videoId}`),
};

// Comments APIs
export const commentsAPI = {
  getVideoComments: (videoId, page = 1, limit = 20) => api.get(`/comments/video/${videoId}?page=${page}&limit=${limit}`),
  addVideoComment: (videoId, content) => api.post(`/comments/video/${videoId}`, { content }),
  updateVideoComment: (commentId, content) => api.patch(`/comments/${commentId}`, { content }),
  deleteVideoComment: (commentId) => api.delete(`/comments/${commentId}`),
};

// Likes APIs
export const likesApi = {
  getLikedVideos: () => api.get('/likes'),
  toggleVideoLike: (videoId) => api.post(`/likes/video/${videoId}`),
  toggleTweetLike: (tweetId) => api.post(`/likes/tweet/${tweetId}`),
  toggleCommentLike: (commentId) => api.post(`/likes/comment/${commentId}`)
}

// Dashboard APIs
export const dashboardApi = {
  getChannelVideos: (channelId, sortBy, sortType, cursor, limit) => 
    api.get(`/dashboard/get-channel-videos?channelId=${channelId}&sortBy=${sortBy}&sortType=${sortType}&cursor=${cursor}&limit=${limit}`),
  getChannelStats: (channelId) => api.get(`/dashboard/${channelId}`)
}

// Subscriptions APIs
export const subscriptionsAPI = {
  toggleSubscription: (channelId) => api.post(`/subscriptions/toggle/${channelId}`),
  getChannelSubscribers: (channelId) => api.get(`/subscriptions/get-subscribers/${channelId}`),

  getSubscribedChannels: (subscriberId) => api.get(`/subscriptions/get-subscribed-channels/${subscriberId}`),
};

// Playlist APIs
export const playlistsApi = {
  createPlaylist: (playlistData) => api.post('/playlists/create-playlist', playlistData),
  getUserPlaylists: (userId, limit, cursor) => 
    api.get(`/playlists/get-user-playlists?userId=${userId}&limit=${limit}&cursor=${cursor}`),
  addVideoToPlaylist: (playlistId, videoId) => api.post(`/playlists/add-video/${playlistId}/${videoId}`),
  removeVideoFromPlaylist: (playlistId, videoId) => api.patch(`/playlists/remove-video/${playlistId}/${videoId}`),
  togglePlaylistPublicStatus: (playlistId) => api.patch(`/playlists/toggle-public-status/${playlistId}`),
  getPlaylistById: (playlistId) => api.get(`/playlists/${playlistId}`),
  deletePlaylist: (playlistId) => api.delete(`/playlists/${playlistId}`),
  updatePlaylist: (playlistId, data) => api.patch(`/playlists/${playlistId}`, data),
}

// HealthCheck API
export const healthCheckAPI = {
  check: () => api.get('/healthcheck')
}

export default api;
