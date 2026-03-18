import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const SESSION_SECRET = process.env.SESSION_SECRET || "default_secret";

export async function POST(req) {
  try {
    const { password } = await req.json();

    if (password === ADMIN_PASSWORD) {
      // Create a simple token
      const token = crypto
        .createHmac("sha256", SESSION_SECRET)
        .update("admin_authenticated")
        .digest("hex");

      const response = NextResponse.json({ success: true });

      response.cookies.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 Day
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid password" },
      { status: 401 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
