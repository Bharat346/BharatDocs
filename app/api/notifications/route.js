import { NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import { globalNotifications } from "@/lib/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(globalNotifications)
      .orderBy(desc(globalNotifications.createdAt))
      .limit(50);
      
    return NextResponse.json(data);
  } catch (error) {
    console.error("[Notifications API Error]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
