import { NextRequest, NextResponse } from 'next/server';
import { publishStatus } from '@/lib/mastodon';
import { sendTelegramMessage, setTelegramWebhook, TelegramMessage, TelegramUpdate } from '@/lib/telegram';

function getAllowedChatIds(): number[] | null {
  const raw = process.env.ALLOWED_TELEGRAM_CHAT_IDS;
  if (!raw) {
    return null;
  }
  return raw
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)
    .map(Number)
    .filter((value) => !Number.isNaN(value));
}

function extractMessage(update: TelegramUpdate): TelegramMessage | null {
  return (
    update.message ||
    update.edited_message ||
    update.channel_post ||
    update.edited_channel_post ||
    null
  );
}

function extractCommandPayload(text: string) {
  const trimmed = text.trim();
  if (!trimmed.startsWith('/')) {
    return null;
  }

  const [rawCommand, ...rest] = trimmed.split(/\s+/);
  const command = rawCommand.split('@')[0];
  return { command, args: rest.join(' ').trim() };
}

async function handlePostCommand(chatId: number, payload: string) {
  if (!payload) {
    await sendTelegramMessage(chatId, '⚙️ Usage: <code>/post your message here</code>');
    return;
  }

  try {
    const publishResponse = await publishStatus(payload);
    const statusUrl = publishResponse.url ?? 'Posted to Mastodon';
    await sendTelegramMessage(chatId, `✅ Posted successfully: ${statusUrl}`);
  } catch (error) {
    console.error('Failed to publish Mastodon status', error);
    await sendTelegramMessage(
      chatId,
      '❌ Failed to publish to Mastodon. Please verify credentials and try again.'
    );
    throw error;
  }
}

async function ensureWebhook() {
  const baseUrl = process.env.APP_BASE_URL;
  if (!baseUrl) {
    throw new Error('Missing APP_BASE_URL environment variable for webhook setup');
  }
  await setTelegramWebhook(baseUrl, process.env.TELEGRAM_WEBHOOK_SECRET);
}

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');

  if (action === 'webhook') {
    await ensureWebhook();
    return NextResponse.json({ ok: true, message: 'Webhook configured' });
  }

  return NextResponse.json({ ok: true });
}

export async function POST(request: NextRequest) {
  try {
    const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (secretToken) {
      const headerToken = request.headers.get('x-telegram-bot-api-secret-token');
      if (headerToken !== secretToken) {
        return NextResponse.json({ ok: true }, { status: 200 });
      }
    }

    const update = (await request.json()) as TelegramUpdate;
    const message = extractMessage(update);
    if (!message?.text) {
      return NextResponse.json({ ok: true });
    }

    const allowedChatIds = getAllowedChatIds();
    if (allowedChatIds && !allowedChatIds.includes(message.chat.id)) {
      await sendTelegramMessage(message.chat.id, '🚫 This bot is locked to selected users.');
      return NextResponse.json({ ok: true });
    }

    const payload = extractCommandPayload(message.text);
    if (!payload) {
      return NextResponse.json({ ok: true });
    }

    switch (payload.command) {
      case '/post':
        await handlePostCommand(message.chat.id, payload.args);
        break;
      default:
        await sendTelegramMessage(message.chat.id, '🤖 Supported commands:\n• /post <text>');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error', error);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
