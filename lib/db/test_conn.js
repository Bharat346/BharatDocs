import { db } from "./index";
import { sql } from "drizzle-orm";

async function test() {
  try {
    const result = await db.execute(sql`SELECT 1`);
    console.log("Connection successful:", result);
  } catch (err) {
    console.error("Connection failed:", err);
  }
  process.exit(0);
}

test();
