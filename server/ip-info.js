// server/ip-info.ts
export async function getIPInfo(ip) {
  if (!ip || ip === "unknown") return null;

  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}
