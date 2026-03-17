# LyricFlow — Social Music Content Studio

Upload a song → Claude detects language, genre, mood → generates thumbnail, synced lyrics, captions & hashtags for every platform.

---

## Deploy to Railway (5 minutes)

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "initial commit"
# Create a new repo on github.com, then:
git remote add origin https://github.com/YOUR_USERNAME/lyricflow.git
git push -u origin main
```

### Step 2 — Create Railway project
1. Go to [railway.app](https://railway.app) → New Project
2. Click **Deploy from GitHub repo**
3. Select your `lyricflow` repo
4. Railway auto-detects Next.js and builds it

### Step 3 — Add environment variable
In Railway dashboard → your service → **Variables** tab:
```
ANTHROPIC_API_KEY = sk-ant-your-key-here
```

### Step 4 — Done
Railway gives you a live URL like `lyricflow-production.up.railway.app`

---

## Zero-code quick use

1. Open the app in browser.
2. Upload your MP3/MP4 song.
3. Click **Generate Content**.
4. Pick platform tab (Reels/Shorts/Post/Twitter).
5. Click **Play song** in preview to watch lyrics sync.
6. Download thumbnail PNG, copy caption/title/hashtags, and export `.lrc` lyrics file.

> If `ANTHROPIC_API_KEY` is missing, LyricFlow runs in **demo mode** with auto-generated sample output so you can still use and test the full flow.

---

## Run locally

```bash
npm install
cp .env.example .env.local
# Add your API key to .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How it works

1. **Upload** — Drop any MP3 / MP4 / WAV
2. **Detect** — Claude analyses filename → returns song name, language, genre, mood, lyrics, captions
3. **Preview** — Live thumbnail canvas with profile photo, song title, badges
4. **Export** — Download PNG thumbnail, copy caption, export .lrc lyrics file
5. **Platforms** — Reels, Shorts, Post (1:1), Twitter/X — canvas resizes per platform

## Stack

- **Next.js 14** — App Router
- **TypeScript**
- **Tailwind CSS**
- **Anthropic Claude** (server-side API route — key never exposed to browser)
- **Railway** hosting

## Supported Languages

Telugu, Hindi, Tamil, Kannada, Malayalam, Marathi, English, Arabic — captions generated in the song's detected language or your choice.
