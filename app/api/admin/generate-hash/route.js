import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/crypto-utils";
import { isAuthenticatedAdmin } from "@/lib/auth-server";

export async function POST(req) {
  try {
    if (!(await isAuthenticatedAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();
    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 },
      );
    }

    const hash = hashPassword(password);
    return NextResponse.json({ hash });
  } catch (error) {
    console.error("Hash Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
