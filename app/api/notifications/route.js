import { NextResponse } from "next/server";
import { getActiveNotifications } from "@/lib/db/queries/notifications";
import { withCacheHeaders } from "@/lib/cache/headers";

export async function GET() {
  try {
    const data = await getActiveNotifications();

    return withCacheHeaders(NextResponse.json(data), "notifications");
  } catch (error) {
    console.error("GET /api/notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications", code: "NOTIFICATIONS_ERROR" },
      { status: 500 },
    );
  }
}
