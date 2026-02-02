// api/session/verify/route.js
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { verifySession } from "@/server/session";

export async function POST(req) {
  const { session } = await req.json();

  if (!session) {
    return NextResponse.json({ valid: false }, { status: 400 });
  }

  return NextResponse.json({
    valid: verifySession(session),
  });
}
