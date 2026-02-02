// server/access-log.ts
import { db } from "@/lib/db/index";
import { accessLogs } from "@/lib/db/schema";

export async function writeAccessLog(data) {
  try {
    await db.insert(accessLogs).values({
      username: data.username ?? null,
      nodeId: data.nodeId ?? null,
      ipAddress: data.ipAddress ?? null,
      userAgent: data.userAgent ?? null,
      path: data.path,
      method: data.method,
      status: data.status,
      responseTime: data.responseTime ?? null,

      country: data.ipInfo?.country ?? null,
      countryCode: data.ipInfo?.countryCode ?? null,
      region: data.ipInfo?.region ?? null,
      regionName: data.ipInfo?.regionName ?? null,
      city: data.ipInfo?.city ?? null,
      zip: data.ipInfo?.zip ?? null,

      lat: data.ipInfo?.lat?.toString() ?? null,
      lon: data.ipInfo?.lon?.toString() ?? null,
      timezone: data.ipInfo?.timezone ?? null,

      isp: data.ipInfo?.isp ?? null,
      org: data.ipInfo?.org ?? null,
      asn: data.ipInfo?.as ?? null,
    });
  } catch {
    // logging must never break request
  }
}
