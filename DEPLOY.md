# Deployment Guide

## Prerequisites

- Node.js 22+
- Redis instance (local or hosted — e.g. Upstash, Redis Cloud)

## Environment Variables

### Server (`apps/server/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 3001) |
| `REDIS_URL` | Yes | Redis connection string |
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
npm install && npm run build -w @gameion/shared && npm run build -w @gameion/server
```

**Start Command:**
```bash
npm start -w @gameion/server
```

**Environment Variables:** Set `REDIS_URL`, `CORS_ORIGIN`, and optionally `TURN_*` vars.

## TURN Servers

Public STUN servers are included by default but fail on symmetric NATs (common on mobile networks). For reliable WebRTC on 4G/5G:

1. Sign up for a TURN provider (Metered, Twilio, Xirsys)
2. Set `TURN_URL`, `TURN_USERNAME`, `TURN_SECRET` on the server
3. The `/ice-servers` endpoint will automatically include TURN credentials

## Local Development

```bash
# Start Redis
redis-server

# Start both server and client
npm run dev
```

Server runs on `http://localhost:3001`, client on `http://localhost:5173`.
