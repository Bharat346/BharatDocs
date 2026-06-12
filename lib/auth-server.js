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

  try {
    const decoded = Buffer.from(adminSession.value, "base64").toString("utf8");
    const [username, expiresAt, signature] = decoded.split(":");
    
    if (!username || !expiresAt || !signature) return false;
    
    if (Date.now() > parseInt(expiresAt, 10)) return false;

    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(`${username}:${expiresAt}`)
      .digest("hex");

    return signature === expectedSignature;
  } catch (err) {
    return false;
  }
}
