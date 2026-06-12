import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import { db } from "@/lib/db";
import { admins } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/crypto-utils";

const SESSION_SECRET = process.env.SESSION_SECRET || "default_secret";

export async function POST(req) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: "Username and password are required" },
        { status: 400 },
      );
    }

    // Check database
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.username, username))
      .limit(1);

    if (admin && verifyPassword(password, admin.passwordHash)) {
      // Create a secure token: base64(username:expiration:signature)
      const expiresAt = Date.now() + 60 * 60 * 24 * 1000; // 1 day
      const payload = `${username}:${expiresAt}`;
      const signature = crypto
        .createHmac("sha256", SESSION_SECRET)
        .update(payload)
        .digest("hex");
      const token = Buffer.from(`${payload}:${signature}`).toString("base64");

      const response = NextResponse.json({ success: true });

      // Clear existing first to be safe
      response.cookies.delete("admin_session");
      response.cookies.delete("admin_user");

      response.cookies.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 1 Day
      });

      // Store username in a cookie too for the profile
      response.cookies.set("admin_user", username, {
        httpOnly: false,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: "Invalid username or password" },
      { status: 401 },
    );
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
