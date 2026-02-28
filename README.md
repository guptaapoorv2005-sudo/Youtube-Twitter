# XTube

A full-stack video sharing platform built with **Express 5**, **MongoDB**, **React 19**, and **Cloudinary**. Users can upload videos, create playlists, post tweets, subscribe to channels, like content, and manage their watch history.

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
  - [Healthcheck](#healthcheck)
  - [Users](#users)
  - [Videos](#videos)
  - [Tweets](#tweets)
  - [Subscriptions](#subscriptions)
  - [Comments](#comments)
  - [Likes](#likes)
  - [Dashboard](#dashboard)
  - [Playlists](#playlists)
  - [Watch History](#watch-history)
- [Data Models](#data-models)
- [Authentication](#authentication)
- [Error Handling](#error-handling)

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                        │
│                                                                  │
│   React 19 + React Router 7 + Tailwind CSS 4 + Framer Motion     │
│   Vite dev server proxies /api → localhost:8000                  │
└──────────────────────┬───────────────────────────────────────────┘
                       │  HTTP (JSON + cookies)
                       ▼
┌──────────────────────────────────────────────────────────────────┐
│                       EXPRESS 5 SERVER (:8000)                   │
│                                                                  │
│  ┌────────────┐  ┌──────────┐  ┌────────────┐  ┌─────────────┐   │
│  │   CORS     │→ │  Cookie  │→ │   JSON /   │→ │   Routes    │   │
│  │ Middleware │  │  Parser  │  │  URL Body  │  │  (10 groups)│   │
│  └────────────┘  └──────────┘  └────────────┘  └──────┬──────┘   │
│                                                       │          │
│  ┌────────────────────────────────────────────────────┘          │
│  │                                                               │
│  │  Middleware Pipeline:                                         │
│  │  ┌──────────┐  ┌──────────┐   ┌──────────────┐                │
│  │->│ verifyJWT│→ │  Multer  │→  │  Controller  │                │
│     │ (Auth)   │  │ (Upload) │   │   Handler    │                │
│     └──────────┘  └──────────┘   └──────┬───────┘                │
│                                         │                        │
│            ┌──────────────────────────────────┐                  │
│            │  Global Error Handler (last)     │                  │
│            └──────────────────────────────────┘                  │
│                                                                  │
└──────────────┬──────────────────────────────┬────────────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────┐       ┌──────────────────────────┐
│     MongoDB Atlas    │       │       Cloudinary CDN     │
│                      │       │                          │
│  Database: videotube │       │  • Video files           │
│                      │       │  • Thumbnails            │
│  Collections:        │       │  • Avatars               │
│  • users             │       │  • Cover images          │
│  • videos            │       │                          │
│  • comments          │       │  Upload: local temp →    │
│  • likes             │       │    Cloudinary → delete   │
│  • playlists         │       │    local temp file       │
│  • subscriptions     │       │                          │
│  • tweets            │       └──────────────────────────┘
│  • watchhistories    │
└──────────────────────┘
```

### Request Flow

```
Client Request
    │
    ├─ 1. CORS check
    ├─ 2. Cookie parsing
    ├─ 3. Body parsing (JSON / URL-encoded, 16 KB limit)
    ├─ 4. Route matching (/api/v1/*)
    ├─ 5. JWT verification (protected routes)
    ├─ 6. File upload via Multer (if applicable)
    ├─ 7. Controller logic (DB queries, Cloudinary ops)
    ├─ 8. ApiResponse / ApiError returned
    └─ 9. Global error handler catches any unhandled errors
```

---

## Tech Stack

### Backend

| Technology | Purpose |
|------------|---------|
| Express 5 | Web framework |
| MongoDB + Mongoose 8 | Database & ODM |
| Cloudinary | Media storage (videos, images) |
| JWT | Authentication (access + refresh tokens) |
| bcrypt | Password hashing |
| Multer | Multipart file uploads |
| cookie-parser | HTTP-only cookie management |

### Frontend

| Technology | Purpose |
|------------|---------|
| React 19 | UI library |
| React Router 7 | Client-side routing |
| Tailwind CSS 4 | Utility-first styling |
| Framer Motion | Animations |
| Axios | HTTP client |
| Lucide React | Icon library |
| Vite 7 | Build tool & dev server |

---

## Project Structure

```
├── backend/
│   ├── .env                          # Environment variables
│   ├── package.json
│   ├── public/temp/                  # Temporary file uploads
│   └── src/
│       ├── index.js                  # Entry point — connects DB, starts server
│       ├── app.js                    # Express app config, middleware, routes
│       ├── constants.js              # DB_NAME = "videotube"
│       ├── controllers/              # Route handlers (business logic)
│       ├── db/index.js               # MongoDB connection
│       ├── middlewares/
│       │   ├── auth.middleware.js    # JWT verification
│       │   ├── multer.middleware.js  # File upload config
│       │   └── error.middleware.js   # Global error handler
│       ├── models/                   # Mongoose schemas
│       ├── routes/                   # Express route definitions
│       └── utils/
│           ├── ApiError.js           # Custom error class
│           ├── ApiResponse.js        # Standardized response class
│           ├── asyncHandler.js       # Async route wrapper
│           └── cloudinary.js         # Upload/delete helpers
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js            # Proxy /api → backend
    └── src/
        ├── main.jsx              # Entry point
        ├── App.jsx               # Root component
        ├── api/                  # Axios API client modules
        ├── components/           # Reusable UI components
        ├── context/              # React context (AuthContext)
        ├── hooks/                # Custom hooks (useAuth)
        ├── layouts/              # Page layouts (Auth, Main)
        ├── pages/                # Route-level page components
        ├── routes/               # Router config & ProtectedRoute
        └── utils/                # Formatters, constants
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** or **yarn**
- **MongoDB** instance (local or [MongoDB Atlas](https://cloud.mongodb.com/))
- **Cloudinary** account ([sign up free](https://cloudinary.com/))

### Backend Setup

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Create a .env file (see Environment Variables below)
cp .env.example .env   # or create manually

# 4. Start the development server
npm run dev
```

The backend runs on **http://localhost:8000** by default.

### Frontend Setup

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Start the Vite dev server
npm run dev
```

The frontend runs on **http://localhost:5173** and proxies `/api` requests to the backend.

### Environment Variables

Create a `.env` file in the `backend/` directory:

```env
PORT=8000
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net
CORS_ORIGIN=*
NODE_ENV=development

ACCESS_TOKEN_SECRET=<your-access-token-secret>
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=<your-refresh-token-secret>
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=<your-cloud-name>
CLOUDINARY_API_KEY=<your-api-key>
CLOUDINARY_API_SECRET=<your-api-secret>
```

---

## API Documentation

**Base URL:** `/api/v1`

All responses follow a standard format:

```json
{
  "statusCode": 200,
  "data": { ... },
  "message": "Success",
  "success": true
}
```

Error responses:

```json
{
  "statusCode": 400,
  "message": "Error description",
  "success": false,
  "errors": []
}
```

> 🔒 = Requires authentication (JWT via cookie or `Authorization: Bearer <token>` header)
>
> 📎 = Accepts file upload (multipart/form-data)

---

### Healthcheck

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/healthcheck/` | — | Server health status |

---

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/users/register` | — 📎 | Register new user. Upload `avatar` (required) and `coverImage` (optional) |
| `POST` | `/users/login` | — | Login with username/email and password |
| `POST` | `/users/logout` | 🔒 | Logout (clears refresh token) |
| `POST` | `/users/refresh-token` | — | Refresh access token using refresh token cookie |
| `GET` | `/users/current-user` | 🔒 | Get authenticated user's profile |
| `PATCH` | `/users/change-password` | 🔒 | Change password (requires old + new password) |
| `PATCH` | `/users/update-account` | 🔒 | Update fullName, email |
| `PATCH` | `/users/update-avatar` | 🔒 📎 | Upload new avatar image |
| `PATCH` | `/users/update-cover` | 🔒 📎 | Upload new cover image |
| `GET` | `/users/channel/:username` | 🔒 | Get channel profile with subscriber counts |

---

### Videos

> All video routes require authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/videos/` | 🔒 | List all videos (supports pagination, filtering) |
| `POST` | `/videos/` | 🔒 📎 | Publish a video. Upload `videoFile` and `thumbnail` |
| `GET` | `/videos/:videoId` | 🔒 | Get video by ID |
| `PATCH` | `/videos/:videoId` | 🔒 📎 | Update video details / thumbnail |
| `DELETE` | `/videos/:videoId` | 🔒 | Delete a video (removes from Cloudinary) |
| `PATCH` | `/videos/update-views/:videoId` | 🔒 | Increment view count |
| `PATCH` | `/videos/toggle/publish/:videoId` | 🔒 | Toggle published/unpublished |

---

### Tweets

> All tweet routes require authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/tweets/` | 🔒 | Create a tweet |
| `GET` | `/tweets/allTweets` | 🔒 | Get all tweets |
| `PATCH` | `/tweets/:tweetId` | 🔒 | Update a tweet |
| `DELETE` | `/tweets/:tweetId` | 🔒 | Delete a tweet |

---

### Subscriptions

> All subscription routes require authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/subscriptions/toggle/:channelId` | 🔒 | Toggle subscription to a channel |
| `GET` | `/subscriptions/get-subscribers/:channelId` | 🔒 | Get subscriber list for a channel |
| `GET` | `/subscriptions/get-subscribed-channels/:subscriberId` | 🔒 | Get channels a user subscribes to |

---

### Comments

> All comment routes require authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/comments/video/:videoId` | 🔒 | Get paginated comments for a video |
| `POST` | `/comments/video/:videoId` | 🔒 | Add a comment to a video |
| `PATCH` | `/comments/:commentId` | 🔒 | Edit a comment (owner only) |
| `DELETE` | `/comments/:commentId` | 🔒 | Delete a comment (owner only) |

---

### Likes

> All like routes require authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/likes/video/:videoId` | 🔒 | Toggle like on a video |
| `POST` | `/likes/comment/:commentId` | 🔒 | Toggle like on a comment |
| `POST` | `/likes/tweet/:tweetId` | 🔒 | Toggle like on a tweet |
| `GET` | `/likes/` | 🔒 | Get all videos liked by current user |

---

### Dashboard

> All dashboard routes require authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/dashboard/:channelId` | 🔒 | Get channel stats (total views, subscribers, videos, likes) |
| `GET` | `/dashboard/get-channel-videos` | 🔒 | Get all videos uploaded by the authenticated user |

---

### Playlists

> All playlist routes require authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/playlists/create-playlist` | 🔒 | Create a new playlist |
| `GET` | `/playlists/get-user-playlists` | 🔒 | Get current user's playlists |
| `GET` | `/playlists/:playlistId` | 🔒 | Get playlist details with videos |
| `PATCH` | `/playlists/:playlistId` | 🔒 | Update playlist name/description |
| `DELETE` | `/playlists/:playlistId` | 🔒 | Delete a playlist |
| `POST` | `/playlists/add-video/:playlistId/:videoId` | 🔒 | Add a video to a playlist |
| `PATCH` | `/playlists/remove-video/:playlistId/:videoId` | 🔒 | Remove a video from a playlist |
| `PATCH` | `/playlists/toggle-public-status/:playlistId` | 🔒 | Toggle playlist public/private |

---

### Watch History

> All history routes require authentication.

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `GET` | `/history/` | 🔒 | Get user's watch history (most recent first) |
| `POST` | `/history/:videoId` | 🔒 | Add/update a video in watch history |
| `DELETE` | `/history/:videoId` | 🔒 | Remove a video from watch history |

---

## Data Models

### User

| Field | Type | Notes |
|-------|------|-------|
| `username` | String | Unique, lowercase, indexed |
| `email` | String | Unique, lowercase, indexed |
| `fullName` | String | Required |
| `avatar` | String | Cloudinary URL, required |
| `coverImage` | String | Cloudinary URL, optional |
| `password` | String | Bcrypt hashed (auto on save) |
| `refreshToken` | String | JWT refresh token |

### Video

| Field | Type | Notes |
|-------|------|-------|
| `videoFile` | String | Cloudinary URL |
| `thumbnail` | String | Cloudinary URL |
| `owner` | ObjectId → User | |
| `title` | String | Required |
| `description` | String | Required |
| `duration` | Number | In seconds |
| `views` | Number | Default: 0 |
| `isPublished` | Boolean | Default: true |

### Comment

| Field | Type | Notes |
|-------|------|-------|
| `content` | String | Required |
| `video` | ObjectId → Video | |
| `owner` | ObjectId → User | |

### Like

| Field | Type | Notes |
|-------|------|-------|
| `video` | ObjectId → Video | One of: video, comment, or tweet |
| `comment` | ObjectId → Comment | |
| `tweet` | ObjectId → Tweet | |
| `likedBy` | ObjectId → User | |

> Unique partial indexes prevent duplicate likes per user per entity.

### Playlist

| Field | Type | Notes |
|-------|------|-------|
| `name` | String | Unique per owner |
| `description` | String | Optional |
| `isPublic` | Boolean | Default: true |
| `videos` | [ObjectId → Video] | Array of video refs |
| `totalVideos` | Number | Computed count |
| `owner` | ObjectId → User | |

### Subscription

| Field | Type | Notes |
|-------|------|-------|
| `subscriber` | ObjectId → User | The user who subscribes |
| `channel` | ObjectId → User | The channel being subscribed to |

> Unique compound index on `{channel, subscriber}`.

### Tweet

| Field | Type | Notes |
|-------|------|-------|
| `owner` | ObjectId → User | |
| `content` | String | Required |

### WatchHistory

| Field | Type | Notes |
|-------|------|-------|
| `user` | ObjectId → User | |
| `video` | ObjectId → Video | |

> Unique compound index on `{user, video}`. Updating an existing entry refreshes `updatedAt`.

---

## Authentication

The app uses a **dual-token JWT strategy**:

| Token | Stored In | Expiry | Contains |
|-------|-----------|--------|----------|
| Access Token | HTTP-only cookie + `Authorization` header | 1 day | `_id`, `username`, `email`, `fullName` |
| Refresh Token | HTTP-only cookie + database | 10 days | `_id` |

**Flow:**

1. **Register/Login** → Server generates both tokens, sets HTTP-only cookies, stores refresh token in DB
2. **Authenticated requests** → `verifyJWT` middleware extracts token from cookie or `Authorization: Bearer <token>` header
3. **Token refresh** → Client sends expired access token scenario → calls `/users/refresh-token` → server verifies refresh token against DB → issues new token pair
4. **Logout** → Server clears refresh token from DB and removes cookies

---

## Error Handling

All errors flow through a centralized error middleware:

- **`ApiError`** — Custom error class with `statusCode`, `message`, `errors[]`, and `success: false`
- **`asyncHandler`** — Wraps async controllers so rejected promises are automatically forwarded to the error middleware via `next(err)`
- **`errorHandler`** — Global Express error middleware returns consistent JSON; includes stack traces in development mode

---

## Frontend Pages

| Route | Page | Description |
|-------|------|-------------|
| `/login` | Login | User authentication |
| `/register` | Register | New user registration |
| `/` | Home | Video feed |
| `/watch/:videoId` | Watch | Video player with comments |
| `/channel/:username` | Profile | Channel profile page |
| `/settings` | Settings | Account settings |
| `/liked-videos` | Liked Videos | Videos liked by user |
| `/history` | History | Watch history |
| `/subscriptions` | Subscriptions | Subscribed channels |
| `/upload` | Upload | Video upload form |
| `/playlists` | Playlists | User's playlists |
| `/playlists/:playlistId` | Playlist Detail | Single playlist view |

---

## License

ISC

---

**Author:** Apoorv Gupta
