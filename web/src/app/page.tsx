import styles from "./page.module.css";

const setupSteps = [
  "Copy `env.local.example` → `.env.local`.",
  "Add your `TELEGRAM_BOT_TOKEN` from BotFather.",
  "Set `APP_BASE_URL` to the deployed Vercel URL.",
  "Provide `MASTODON_BASE_URL` & `MASTODON_ACCESS_TOKEN` (`write:statuses`).",
  "Optional: restrict `ALLOWED_TELEGRAM_CHAT_IDS` (comma separated IDs).",
];

const webhookSteps = [
  "Deploy the project so a public HTTPS URL is ready.",
  "Request `/api/telegram?action=webhook` once to register.",
  "Run `/getwebhookinfo` in BotFather to confirm it points here.",
];

const commandSteps = [
  "Send `/post Your message` to publish a Mastodon status.",
  "The agent replies in Telegram with a success link.",
  "Invalid usage returns guidance and respects any allowlist.",
];

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Telegram → Mastodon Agent</h1>
          <p>
            Automate Mastodon updates directly from Telegram. Configure the env
            variables, register the webhook, and start posting with the{" "}
            <code>/post</code> command.
          </p>
        </header>

        <section className={styles.grid}>
          <Card title="Configure Environment" items={setupSteps} />
          <Card title="Activate Webhook" items={webhookSteps} />
          <Card title="Use Commands" items={commandSteps} />
        </section>

        <footer className={styles.footer}>
          Built with Next.js App Router • Deploy-ready for Vercel • Integrates Telegram Bot + Mastodon APIs
        </footer>
      </main>
    </div>
  );
}

type CardProps = {
  title: string;
  items: string[];
};

function Card({ title, items }: CardProps) {
  return (
    <article className={styles.card}>
      <h2>{title}</h2>
      <ol className={styles.list}>
        {items.map((item) => (
          <li key={item} dangerouslySetInnerHTML={{ __html: item }} />
        ))}
      </ol>
    </article>
  );
}
