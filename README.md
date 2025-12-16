## Features

- ✅ User authentication (JWT)
- ✅ 1:1 text chat
- ✅ Group text chat (rooms/channels)
- ✅ Online/offline presence and typing indicators
- ✅ 1:1 audio/video calls (WebRTC)
- ✅ Group video calls per chat room
- ✅ Basic message pagination

## Architecture Overview

- **Frontend:** React + Vite, Socket.IO client, WebRTC for audio/video.
- **Backend:** Node.js + Express, Socket.IO, PostgreSQL (or MongoDB) for users/rooms/messages.
- **Real-time:** Socket.IO rooms:
  - `user:<id>` for personal events
  - `room:<roomId>` for chat
  - `video:<roomId>` for group calls
- **WebRTC signaling:** All offers/answers/ICE candidates go over Socket.IO events:
  - `call:offer`, `call:answer`, `call:candidate`, `call:end`
  - `video:join`, `video:leave`, `video:signal`

## Running Locally

```bash
# In backend/
cp .env.example .env
# set DATABASE_URL, REDIS_URL, JWT_SECRET

npm install
npm run dev

# In frontend/
cp .env.example .env
# set VITE_API_URL, VITE_WS_URL

npm install
npm run dev
