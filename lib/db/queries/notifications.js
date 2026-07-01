import { db } from "../index.js";
import { notifications } from "../schema.js";
import { desc, gt } from "drizzle-orm";
import { cached } from "@/lib/cache/lru";

/* ── Get active notifications (not expired) ── */
async function _getActiveNotifications(limit = 20) {
  const now = new Date();

  return db
    .select()
    .from(notifications)
    .where(gt(notifications.expiresAt, now))
    .orderBy(desc(notifications.createdAt))
    .limit(limit);
}

export async function getActiveNotifications(limit = 20) {
  // Short TTL since notifications are time-sensitive
  return cached("queries", `notifications:active:${limit}`, () =>
    _getActiveNotifications(limit),
  );
}
