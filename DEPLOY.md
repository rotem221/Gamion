# Deployment Guide

## Prerequisites

- Node.js 22+
- Redis instance (optional — enables multi-instance scaling; falls back to in-memory state)

## Environment Variables

### Server (`apps/server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3001) |
| `REDIS_URL` | No | Redis connection string (falls back to in-memory if not set) |
| `CORS_ORIGIN` | Yes | Frontend URL (e.g. `https://gameion.vercel.app`) |
| `TURN_URL` | No | TURN server URL for reliable WebRTC |
| `TURN_USERNAME` | No | TURN username |
| `TURN_SECRET` | No | TURN credential |

### Client (`apps/client/.env`)

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | Yes | Backend URL (e.g. `https://gameion-api.onrender.com`) |
| `VITE_SOCKET_URL` | Yes | Socket.io URL (same as API URL for most setups) |

## Frontend (Vercel / Netlify)

**Build Command:**
```bash
npm run build -w @gameion/client
```

**Output Directory:**
```
apps/client/dist
```

**Root Directory:** Repository root (monorepo — needs workspace access)

**Environment Variables:** Set `VITE_API_URL` and `VITE_SOCKET_URL` to your backend URL.

## Backend (Render / Railway)

**Build Command:**
```bash
npm install && npm run build -w @gameion/server
```
(The server's `prebuild` script automatically builds `@gameion/shared` first.)

**Start Command:**
```bash
npm start -w @gameion/server
```

**Environment Variables:** Set `CORS_ORIGIN` to the client URL. Optionally set `REDIS_URL` for scaling and `TURN_*` vars for WebRTC reliability.

## TURN Servers

Public STUN servers are included by default but fail on symmetric NATs (common on mobile networks). For reliable WebRTC on 4G/5G:

1. Sign up for a TURN provider (Metered, Twilio, Xirsys)
2. Set `TURN_URL`, `TURN_USERNAME`, `TURN_SECRET` on the server
3. The `/ice-servers` endpoint will automatically include TURN credentials

## Railway Setup

When deploying to Railway with separate client and server services:

1. **Server service:** Set `CORS_ORIGIN` to the client's Railway URL (e.g. `https://gameionclient-production.up.railway.app`)
2. **Client service:** Set `VITE_API_URL` and `VITE_SOCKET_URL` to the server's Railway URL (e.g. `https://gameionserver-production.up.railway.app`)

> **Note:** `VITE_*` variables are baked in at build time. After changing them, trigger a redeploy.

## Local Development

```bash
# Start both server and client (no Redis needed)
npm run dev
```

Server runs on `http://localhost:3001`, client on `http://localhost:5173`.
