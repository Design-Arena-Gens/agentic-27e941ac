## Telegram → Mastodon Agent

Automate Mastodon posts by sending commands to your Telegram bot. This project exposes a webhook endpoint that receives Telegram updates and posts the message payload to Mastodon using its REST API.

### Requirements

- Node.js 18+
- A Telegram bot token from BotFather
- A Mastodon access token with `write:statuses`
- Public HTTPS URL (e.g. Vercel deployment) for the webhook

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy environment variables template:
   ```bash
   cp env.local.example .env.local
   ```
3. Fill in `.env.local`:
   - `TELEGRAM_BOT_TOKEN`: BotFather token
   - `TELEGRAM_WEBHOOK_SECRET`: Secret string to validate Telegram requests
   - `APP_BASE_URL`: Public site URL (e.g. `https://agentic-27e941ac.vercel.app`)
   - `MASTODON_BASE_URL`: Base instance URL (e.g. `https://mastodon.social`)
   - `MASTODON_ACCESS_TOKEN`: Personal access token with `write:statuses`
   - `ALLOWED_TELEGRAM_CHAT_IDS` (optional): Comma separated chat IDs allowed to use the bot

4. Run locally:
   ```bash
   npm run dev
   ```

### Deploy & Register Webhook

1. Deploy to Vercel.
2. Hit `/api/telegram?action=webhook` (e.g. `https://agentic-27e941ac.vercel.app/api/telegram?action=webhook`) to register the webhook.
3. Confirm with BotFather using `/getwebhookinfo`.

### Usage

- Send `/post your message` to the Telegram bot.
- The agent publishes the message to Mastodon and replies with the resulting status link.
- Incorrect commands return usage guidance; unauthorized chats are rejected when an allowlist is configured.

### Scripts

- `npm run dev` – start development server
- `npm run build` – build for production
- `npm start` – run production build locally
- `npm run lint` – lint the project

### Notes

- The API route runs on the Node.js runtime to ensure compatibility with Mastodon and Telegram SDK calls.
- Telegram requests are verified against `TELEGRAM_WEBHOOK_SECRET` when provided.
- Mastodon publishing uses `fetch` with form encoding to match the API requirements.
