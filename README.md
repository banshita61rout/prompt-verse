# Prompt Verse

An AI chat app built with React (Vite), Express, MongoDB, and Groq (free tier, no card required).

## Project structure

```
prompt-verse/
├── backend/
│   ├── models/Thread.js
│   ├── routes/chat.js
│   ├── utils/Groq.js
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    └── .env.example
```

## Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Fill in `.env`:
- `MONGODB_URI` — get a free cluster at mongodb.com/atlas (free tier, no card needed)
- `GROQ_API_KEY` — get a free key at console.groq.com/keys (no card needed)

```bash
npm run dev
```

## Frontend setup

```bash
cd frontend
npm install
cp .env.example .env
```

Set `VITE_API_URL` to your backend URL (`http://localhost:8080` for local dev).

```bash
npm run dev
```

## Deploying

- **Backend**: Render or Railway free tier (Vercel/Netlify are built for frontends, not always-on Node servers with a persistent DB connection).
- **Frontend**: Netlify or Vercel — set `VITE_API_URL` as an environment variable in the dashboard, pointing to your deployed backend URL.

Never commit `.env` — it's already in `.gitignore`.
