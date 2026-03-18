import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "default_secret";

export default async function AdminProtectedLayout({ children }) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  // Re-generate the expected token to verify
  const expectedToken = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update("admin_authenticated")
    .digest("hex");

  if (!adminSession || adminSession.value !== expectedToken) {
    redirect("/admin/login");
  }

  return children;
}
