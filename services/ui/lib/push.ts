import * as webpush from "web-push";
import { Client, Pool } from "pg";

let started = false;
let queryPool: Pool | null = null;

export function startPushListener() {
  if (started) return;
  started = true;

  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;

  if (!publicKey || !privateKey) {
    console.log("[push] VAPID keys not configured, push disabled");
    return;
  }

  webpush.setVapidDetails("mailto:admin@gobau.dev", publicKey, privateKey);

  const connStr = process.env.DATABASE_URL;
  if (!connStr) {
    console.log("[push] DATABASE_URL not set, push disabled");
    return;
  }

  queryPool = new Pool({ connectionString: connStr, max: 2 });
  connect(connStr);
}

function connect(connStr: string) {
  const client = new Client({ connectionString: connStr });

  client
    .connect()
    .then(() => client.query("LISTEN notification_inserted"))
    .then(() => {
      console.log("[push] LISTEN notification_inserted started");
    })
    .catch((err) => {
      console.error("[push] connect failed, retrying in 5s", err.message);
      setTimeout(() => connect(connStr), 5000);
      return;
    });

  client.on("notification", async (msg) => {
    if (msg.channel !== "notification_inserted" || !msg.payload) return;

    try {
      const data = JSON.parse(msg.payload);
      await broadcastPush(data);
    } catch (err) {
      console.error("[push] broadcast error:", err);
    }
  });

  client.on("error", (err) => {
    console.error("[push] connection lost, reconnecting in 5s", err.message);
    client.end().catch(() => {});
    setTimeout(() => connect(connStr), 5000);
  });
}

function shouldPush(data: { level?: string; category?: string }): boolean {
  const level = data.level || "info";
  if (level === "critical" || level === "warning") return true;
  const cat = data.category || "";
  if (["report", "daily_summary", "deploy"].includes(cat)) return true;
  return false;
}

async function broadcastPush(data: {
  id?: number;
  level?: string;
  title?: string;
  message?: string;
  category?: string;
}) {
  if (!queryPool) return;
  if (!shouldPush(data)) return;

  const res = await queryPool.query(
    "SELECT endpoint, p256dh, auth FROM push_subscriptions"
  );

  if (res.rows.length === 0) return;

  const payload = JSON.stringify({
    id: data.id,
    level: data.level || "info",
    title: data.title || "Trading Terminal",
    message: data.message || "",
  });

  const results = await Promise.allSettled(
    res.rows.map((row) =>
      webpush.sendNotification(
        {
          endpoint: row.endpoint,
          keys: { p256dh: row.p256dh, auth: row.auth },
        },
        payload
      )
    )
  );

  // Clean up expired subscriptions (410 Gone)
  const expired = results
    .map((r, i) => ({ result: r, row: res.rows[i] }))
    .filter(
      ({ result }) =>
        result.status === "rejected" &&
        (result.reason as any)?.statusCode === 410
    );

  if (expired.length > 0) {
    const endpoints = expired.map(({ row }) => row.endpoint);
    await queryPool.query(
      "DELETE FROM push_subscriptions WHERE endpoint = ANY($1)",
      [endpoints]
    );
    console.log(`[push] cleaned ${expired.length} expired subscriptions`);
  }

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  if (sent > 0 || failed > 0) {
    console.log(`[push] sent ${sent}/${res.rows.length}`, data.title);
  }
}
