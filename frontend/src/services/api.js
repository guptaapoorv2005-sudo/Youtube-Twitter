import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/current-user'),
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
  getVideos: (page = 1, limit = 12) => api.get(`/videos?page=${page}&limit=${limit}`),
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
  updateProfile: (data) =>
    api.patch('/users/profile', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getUserPosts: (userId, page = 1, limit = 10) =>
    api.get(`/users/${userId}/posts?page=${page}&limit=${limit}`),
  getUserVideos: (userId, page = 1, limit = 12) =>
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
