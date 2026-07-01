import { db } from "@/lib/db/index";
import { accessLogs } from "@/lib/db/schema";

export async function writeAccessLog(data) {
  try {
    await db.insert(accessLogs).values({
      path: data.path,
      method: data.method,
      status: data.status,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      responseTime: data.responseTime ?? null,
    });
  } catch {
    // logging must never break request
  }
}
