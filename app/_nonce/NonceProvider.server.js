import { headers } from "next/headers";

export default async function NonceProvider({ children }) {
  const h = await headers();
  const nonce = h.get("x-nonce");

//   console.log("=== REQUEST HEADERS ===");
//   console.log([...h.entries()]);
//   console.log("=== CSP NONCE ===", nonce);

  return children(nonce);
}
