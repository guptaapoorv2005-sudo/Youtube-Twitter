import axios from 'axios';

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

// Posts/Tweets APIs
export const postsAPI = {
  getFeed: (page = 1, limit = 10) => api.get(`/posts?page=${page}&limit=${limit}`),
  createPost: (content, images = []) =>
    api.post('/posts', { content, images }, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getPost: (postId) => api.get(`/posts/${postId}`),
  updatePost: (postId, content) => api.patch(`/posts/${postId}`, { content }),
  deletePost: (postId) => api.delete(`/posts/${postId}`),
  likePost: (postId) => api.post(`/posts/${postId}/like`),
  unlikePost: (postId) => api.delete(`/posts/${postId}/like`),
};

// Videos APIs
export const videosAPI = {
  getVideos: (page = 1, limit = 10) => api.get(`/videos?page=${page}&limit=${limit}`),
  getVideo: (videoId) => api.get(`/videos/${videoId}`),
  createVideo: (formData) =>
    api.post('/videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateVideo: (videoId, data) => api.patch(`/videos/${videoId}`, data),
  deleteVideo: (videoId) => api.delete(`/videos/${videoId}`),
  likeVideo: (videoId) => api.post(`/videos/${videoId}/like`),
  unlikeVideo: (videoId) => api.delete(`/videos/${videoId}/like`),
  getVideoSuggestions: (videoId, limit = 8) =>
    api.get(`/videos/${videoId}/suggestions?limit=${limit}`),
};

// Comments APIs
export const commentsAPI = {
  getComments: (postId, page = 1, limit = 20) =>
    api.get(`/posts/${postId}/comments?page=${page}&limit=${limit}`),
  createComment: (postId, content) =>
    api.post(`/posts/${postId}/comments`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
};

// Users APIs
export const usersAPI = {
  getUser: (userId) => api.get(`/users/${userId}`),
  getUserPosts: (userId, page = 1, limit = 10) =>
    api.get(`/users/${userId}/posts?page=${page}&limit=${limit}`),
  getUserVideos: (userId, page = 1, limit = 10) =>
    api.get(`/users/${userId}/videos?page=${page}&limit=${limit}`),
  followUser: (userId) => api.post(`/users/${userId}/follow`),
  unfollowUser: (userId) => api.delete(`/users/${userId}/follow`),
};

// Subscriptions APIs
export const subscriptionsAPI = {
  getSubscriptions: (page = 1, limit = 20) =>
    api.get(`/subscriptions?page=${page}&limit=${limit}`),
  subscribe: (channelId) => api.post(`/subscriptions/${channelId}`),
  unsubscribe: (channelId) => api.delete(`/subscriptions/${channelId}`),
};

export default api;
