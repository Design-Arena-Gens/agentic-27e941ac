## Agentic Telegram Poster

This repository contains a Next.js application (`web/`) that turns a Telegram bot into a Mastodon posting agent. Deploy it to Vercel, wire up the Telegram webhook, and issue `/post` commands from Telegram to publish to Mastodon automatically.

### Quick Start

1. `cd web`
2. `npm install`
3. Copy `env.local.example` to `.env.local` and supply the required tokens.
4. `npm run dev` to develop locally, `npm run build` + `npm start` to test production build.
5. Deploy to Vercel and invoke `/api/telegram?action=webhook` once to register the Telegram webhook.

See `web/README.md` for full setup and usage details.
