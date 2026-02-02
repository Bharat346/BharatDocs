export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { createSession } from "@/server/session";

const isProd = process.env.NODE_ENV === "production";
const baseUrl = isProd
  ? "https://bhdocs.in"
  : "http://localhost:3000";

export async function GET() {
    const session = createSession();
    const res = NextResponse.redirect(baseUrl);

    res.cookies.set("web_session" , session , {
        httpOnly: true,
        secure: isProd,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 Week
    });

    return res;
}