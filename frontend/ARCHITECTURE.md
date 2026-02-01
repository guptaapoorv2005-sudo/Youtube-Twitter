# VideoX Frontend - Architecture & Flow Diagrams

## 📊 Application Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              App.jsx (Router Setup)                  │  │
│  │  ├─ BrowserRouter                                    │  │
│  │  ├─ AuthProvider (Context)                           │  │
│  │  └─ Routes (Protected & Public)                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │              Layout Component                        │  │
│  │  ├─ Navbar (Search, User Menu)                       │  │
│  │  ├─ Sidebar (Desktop Nav)                            │  │
│  │  ├─ MobileNav (Mobile Menu)                          │  │
│  │  └─ Main Content Area                                │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│         ┌────────────────┼────────────────┐                 │
│         ▼                ▼                ▼                 │
│    ┌─────────┐    ┌─────────┐    ┌──────────┐              │
│    │  Home   │    │ Explore │    │ Watch    │              │
│    │  Page   │    │  Page   │    │ Video    │              │
│    └─────────┘    └─────────┘    └──────────┘              │
│         │                │               │                 │
│         ▼                ▼               ▼                 │
│    ┌─────────────────────────────────────────┐             │
│    │         Component Composition           │             │
│    │  (Cards, Lists, Players, Forms)        │             │
│    └─────────────────────────────────────────┘             │
│                          │                                   │
│                          ▼                                   │
│    ┌─────────────────────────────────────────┐             │
│    │       Services Layer (API Client)      │             │
│    │  ├─ Axios Instance                      │             │
│    │  ├─ Interceptors (Auth Token)           │             │
│    │  └─ API Methods (Posts, Videos, etc)    │             │
│    └─────────────────────────────────────────┘             │
│                          │                                   │
│                          ▼                                   │
│    ┌─────────────────────────────────────────┐             │
│    │      Backend API (REST Endpoints)      │             │
│    │  ├─ http://localhost:8000/api/v1       │             │
│    │  └─ Protected with Bearer Token        │             │
│    └─────────────────────────────────────────┘             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌──────────────────────────────────────────────────────────────┐
│                    User Interaction                          │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  User on Login Page                                          │
│         │                                                   │
│         ▼                                                   │
│  Enter Credentials (Email + Password)                        │
│         │                                                   │
│         ▼                                                   │
│  Submit Form                                                 │
│         │                                                   │
│         ▼                                                   │
│  useAuth Hook: login(email, password)                       │
│         │                                                   │
│         ▼                                                   │
│  API Call: POST /auth/login                                │
│         │                                                   │
│         ▼                                                   │
│  Backend Validates Credentials                              │
│         │                                                   │
│         ▼                                                   │
│  Response: { accessToken, user }                            │
│         │                                                   │
│         ▼                                                   │
│  Store Token in localStorage                                │
│         │                                                   │
│         ▼                                                   │
│  Update AuthContext State                                   │
│         │                                                   │
│         ▼                                                   │
│  Protected Routes Unlock                                    │
│         │                                                   │
│         ▼                                                   │
│  Navigate to Home                                            │
│                                                              │
│  ─────────────────────────────────────────────              │
│                                                              │
│  Subsequent API Calls:                                       │
│                                                              │
│  1. Axios Request Interceptor                               │
│     └─ Adds Authorization Header                            │
│        Authorization: Bearer <token>                        │
│                                                              │
│  2. API Processes Request                                   │
│                                                              │
│  3. Axios Response Interceptor                              │
│     └─ Checks for 401 Unauthorized                          │
│        If 401: Clear storage, redirect to login             │
│                                                              │
│  4. Component Receives Data                                 │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Component Hierarchy

```
App
│
├─ AuthProvider (Context)
│  │
│  ├─ Router
│  │  │
│  │  ├─ Public Routes (Login, Register)
│  │  │
│  │  └─ Protected Routes
│  │     │
│  │     ├─ Layout
│  │     │  ├─ Navbar
│  │     │  │  ├─ Logo/Home Link
│  │     │  │  ├─ Search Bar
│  │     │  │  └─ User Menu
│  │     │  │
│  │     │  ├─ Sidebar (Desktop)
│  │     │  │  ├─ Home Link
│  │     │  │  ├─ Explore Link
│  │     │  │  ├─ Videos Link
│  │     │  │  ├─ Profile Link
│  │     │  │  └─ Logout
│  │     │  │
│  │     │  ├─ MobileNav (Mobile)
│  │     │  │  └─ (Same as Sidebar, drawer style)
│  │     │  │
│  │     │  └─ Main Content
│  │     │     │
│  │     │     ├─ Home Page
│  │     │     │  ├─ CreatePostCard
│  │     │     │  └─ FeedList
│  │     │     │     └─ PostCard[] (map)
│  │     │     │        ├─ User Info
│  │     │     │        ├─ Content
│  │     │     │        ├─ Media
│  │     │     │        └─ Actions (Like, Comment, Share)
│  │     │     │
│  │     │     ├─ Explore Page
│  │     │     │  └─ VideoGrid (map)
│  │     │     │     └─ VideoCard[]
│  │     │     │        ├─ Thumbnail
│  │     │     │        ├─ Title
│  │     │     │        ├─ Channel Info
│  │     │     │        └─ Stats
│  │     │     │
│  │     │     ├─ VideoWatch Page
│  │     │     │  ├─ VideoPlayer
│  │     │     │  │  └─ Video Controls
│  │     │     │  ├─ VideoDetailCard
│  │     │     │  │  ├─ Title, Description
│  │     │     │  │  ├─ Channel Info
│  │     │     │  │  ├─ Subscribe Button
│  │     │     │  │  └─ Like, Comment, Share
│  │     │     │  │
│  │     │     │  └─ Suggestions Sidebar
│  │     │     │     └─ VideoCard[] (suggested)
│  │     │     │
│  │     │     ├─ Profile Page
│  │     │     │  ├─ Cover Image
│  │     │     │  ├─ Avatar
│  │     │     │  ├─ Bio, Stats
│  │     │     │  ├─ Follow/Subscribe Button
│  │     │     │  └─ Tabs
│  │     │     │     ├─ Posts Tab
│  │     │     │     │  └─ PostCard[]
│  │     │     │     ├─ Videos Tab
│  │     │     │     │  └─ VideoCard[]
│  │     │     │     └─ Likes Tab
│  │     │     │
│  │     │     ├─ Login Page
│  │     │     │  ├─ Email Input
│  │     │     │  ├─ Password Input
│  │     │     │  ├─ Submit Button
│  │     │     │  └─ Register Link
│  │     │     │
│  │     │     └─ Register Page
│  │     │        ├─ Username Input
│  │     │        ├─ Email Input
│  │     │        ├─ Password Input
│  │     │        ├─ Confirm Password
│  │     │        ├─ Submit Button
│  │     │        └─ Login Link
│  │
│  └─ API Client (Axios)
│     └─ Interceptors
│        ├─ Request: Add Authorization Header
│        └─ Response: Handle 401 Errors
```

---

## 🔄 Data Flow

```
User Interaction
     │
     ▼
Component Event Handler
     │
     ├─ Update Local State (useState)
     │  OR
     ├─ Call API Method
     │  OR
     ├─ Call useAuth Hook Method
     │
     ▼
API Service Call (api.js)
     │
     ├─ Request Interceptor
     │  └─ Add Auth Token
     │
     ▼
Backend API Endpoint
     │
     ├─ Validate & Process
     │
     ▼
Response
     │
     ├─ Response Interceptor
     │  └─ Check for errors
     │
     ▼
Component Receives Data
     │
     ├─ Update State
     │
     ▼
Component Re-renders
     │
     ▼
Updated UI
```

---

## 📁 File Dependencies

```
App.jsx
├─ AuthContext (import & provider)
├─ AuthProvider (used in root)
├─ Router Setup
├─ Page Components (import 6)
│  ├─ Login.jsx → useAuth, Input, Button
│  ├─ Register.jsx → useAuth, Input, Button
│  ├─ Home.jsx → Layout, FeedList, CreatePostCard, postsAPI
│  ├─ Explore.jsx → Layout, VideoCard, videosAPI
│  ├─ VideoWatch.jsx → Layout, VideoPlayer, VideoDetailCard, videosAPI
│  └─ Profile.jsx → Layout, Card, Tabs, usersAPI
│
└─ Layout.jsx
   ├─ Navbar.jsx → useAuth, useNavigate, IconButton
   ├─ Sidebar.jsx → useNavigate, useLocation, useAuth
   ├─ MobileNav.jsx → useNavigate, useAuth
   │
   └─ Components
      ├─ UI Components
      │  ├─ Button.jsx (framer-motion)
      │  ├─ Card.jsx (framer-motion)
      │  ├─ Modal.jsx (framer-motion, lucide)
      │  ├─ Tabs.jsx (framer-motion)
      │  └─ Input.jsx
      │
      ├─ Feed Components
      │  ├─ PostCard.jsx (UI components, lucide)
      │  ├─ FeedList.jsx (PostCard, framer-motion)
      │  └─ CreatePostCard.jsx (UI components)
      │
      ├─ Video Components
      │  ├─ VideoCard.jsx (UI components, framer-motion)
      │  ├─ VideoPlayer.jsx (lucide, framer-motion)
      │  └─ VideoDetailCard.jsx (Button, lucide, framer-motion)
      │
      └─ Common Components
         ├─ Loader.jsx (framer-motion)
         └─ EmptyState.jsx (lucide, framer-motion)

Services (api.js)
└─ Axios Instance
   ├─ Request Interceptor (token management)
   └─ Response Interceptor (401 handling)

Context (AuthContext.jsx)
└─ useState, useContext, useEffect
   ├─ User state
   ├─ Loading state
   ├─ Auth methods (login, register, logout)
   └─ useAuth hook

Hooks (useCustom.js)
├─ useForm (useState, useCallback)
├─ useInfiniteScroll (useState, useCallback)
└─ useAsync (useState, useCallback, useEffect)

Utils
├─ helpers.js (pure functions)
├─ constants.js (constants)
└─ animations.js (Framer Motion presets)
```

---

## 🔄 State Management Flow

```
AuthContext
│
├─ user (state)
├─ loading (state)
├─ error (state)
├─ isAuthenticated (derived)
│
├─ login() - function
│  └─ Sets: user, error, token
│
├─ register() - function
│  └─ Sets: user, error, token
│
├─ logout() - function
│  └─ Clears: user, token
│
└─ useAuth() - hook
   └─ Returns: { user, loading, error, isAuthenticated, login, register, logout }

Component State
│
├─ Posts/Videos (data)
├─ Loading states
├─ Error states
├─ Form inputs
├─ Modal open/close
├─ Page/offset for pagination
│
└─ Managed by: useState, useCallback
```

---

## 🌐 API Request Flow

```
Component
│
├─ Calls: postsAPI.getFeed(page, limit)
│
├─ OR: postsAPI.likePost(postId)
│
├─ OR: videosAPI.getVideo(videoId)
│
├─ OR: usersAPI.followUser(userId)
│
▼
api.js (Axios Instance)
│
├─ Request Interceptor
│  └─ Adds header: Authorization: Bearer ${token}
│
▼
HTTP Request
GET /api/v1/posts?page=1&limit=10
Headers: { Authorization: Bearer token... }
│
▼
Backend API
│
├─ Validates token
├─ Validates request
├─ Processes data
│
▼
HTTP Response
{
  "data": { ... },
  "message": "Success"
}
│
├─ Response Interceptor
│  ├─ Status 200: Pass through
│  ├─ Status 401: Logout user
│  └─ Status 500: Log error
│
▼
Promise Resolution
│
▼
Component
│
├─ Updates state
├─ Handles error if rejected
└─ Re-renders with new data
```

---

## 🎨 Styling Architecture

```
index.css
│
├─ @import "tailwindcss"
│  └─ Loads all Tailwind utilities
│
├─ App.css
│  ├─ Global styles
│  │  ├─ Body background & text
│  │  ├─ Smooth scroll
│  │  ├─ Custom scrollbar
│  │  └─ Focus states
│  │
│  └─ Animations
│     ├─ @keyframes fadeIn
│     └─ @keyframes slideInUp
│
└─ Inline Tailwind Classes
   │
   ├─ Components use: className="..."
   │
   ├─ Responsive: sm:, md:, lg:, xl:
   │
   ├─ States: hover:, active:, focus:, disabled:
   │
   └─ Dark mode: bg-slate-900, text-white, etc
```

---

## 🚀 Build & Deployment

```
Development
│
├─ npm run dev
│  └─ Vite Dev Server (localhost:5173)
│
├─ Hot Module Replacement (HMR)
│
├─ Fast Refresh
│
└─ Source Maps

Production
│
├─ npm run build
│  │
│  ├─ Vite Bundler
│  │  ├─ Code splitting
│  │  ├─ Tree shaking
│  │  ├─ Minification
│  │  └─ CSS optimization
│  │
│  └─ Output: dist/ folder
│
├─ npm run preview
│  └─ Preview production build locally
│
└─ Deploy
   ├─ Vercel (automatic)
   ├─ Netlify (drag & drop)
   ├─ Docker container
   └─ Any static host
```

---

## 📦 Bundle Structure (Post-Build)

```
dist/
│
├─ index.html
│  └─ Entry point
│
├─ assets/
│  │
│  ├─ main.xxxx.js (main bundle)
│  │  ├─ React + Router
│  │  ├─ All components
│  │  ├─ Services & utilities
│  │  └─ Minified
│  │
│  ├─ main.xxxx.css (styles)
│  │  ├─ Tailwind CSS
│  │  ├─ Global styles
│  │  └─ Minified
│  │
│  └─ chunk-xxxx.js (optional code splits)
│
└─ vite.svg (favicon)
```

---

## 🎯 Execution Order (Critical Path)

```
1. Browser loads index.html
   └─ Loads main.xxxx.js

2. React mounts App component
   └─ <App />

3. AuthProvider initializes
   └─ Checks localStorage for token
   └─ Fetches current user if token exists

4. Router renders
   └─ Checks if user is authenticated

5. If authenticated:
   └─ Renders protected route
   └─ Mounts Layout component
   └─ Mounts requested page component

6. Page component mounts
   └─ useEffect fetches data
   └─ setState with results
   └─ Component re-renders with data

7. User interacts
   └─ Click, type, scroll, etc
   └─ Calls event handler
   └─ May call API
   └─ Updates state
   └─ Component re-renders
   └─ UI updates

8. User navigates
   └─ Clicks navigation link
   └─ React Router changes route
   └─ New page component mounts
   └─ Process repeats from step 6
```

---

This architecture ensures:
✅ Clean separation of concerns
✅ Reusable components
✅ Easy state management
✅ Scalable structure
✅ Maintainable code
✅ Professional quality

