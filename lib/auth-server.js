import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_SECRET = process.env.SESSION_SECRET || "default_secret";

/**
 * Check if the current request is from an authenticated admin.
 * @returns {Promise<boolean>}
 */
export async function isAuthenticatedAdmin() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (!adminSession) return false;

  const expectedToken = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update("admin_authenticated")
    .digest("hex");

  return adminSession.value === expectedToken;
}
