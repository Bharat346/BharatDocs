import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";
import AdminNavbar from "@/components/admin/AdminNavbar";

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

  return (
    <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white transition-colors duration-300">
      <AdminNavbar />
      <main className="max-w-[1600px] mx-auto min-h-[calc(100vh-64px)] overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
