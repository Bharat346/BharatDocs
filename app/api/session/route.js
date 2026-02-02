import { NextResponse } from "next/server";
import { createSession } from "@/server/session";

export async function GET() {
    const session = createSession();
    const res = NextResponse.redirect("https://bharat-docs.vercel.app");

    res.cookies.set("web_session" , session , {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 1 Week
    });

    return res;
}