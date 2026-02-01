export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  VIDEOS: '/videos',
  WATCH: '/watch',
  PROFILE: '/profile',
  LOGIN: '/login',
  REGISTER: '/register',
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    CURRENT_USER: '/auth/current-user',
  },
  POSTS: {
    GET_FEED: '/posts',
    CREATE: '/posts',
    LIKE: (id) => `/posts/${id}/like`,
    UNLIKE: (id) => `/posts/${id}/like`,
  },
  VIDEOS: {
    GET_ALL: '/videos',
    GET_ONE: (id) => `/videos/${id}`,
    LIKE: (id) => `/videos/${id}/like`,
    SUBSCRIBE: (id) => `/subscriptions/${id}`,
  },
  USERS: {
    GET_PROFILE: (id) => `/users/${id}`,
    FOLLOW: (id) => `/users/${id}/follow`,
  },
};

export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  slideIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
};

export const BREAKPOINTS = {
  mobile: 640,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
};

export const TAILWIND_COLORS = {
  primary: 'blue-600',
  secondary: 'slate-700',
  success: 'green-600',
  warning: 'yellow-600',
  danger: 'red-600',
  dark: 'slate-900',
  light: 'slate-100',
};
