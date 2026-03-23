// scripts/setup-rag.js
import { db } from "../lib/db/index.js";
import { sql } from "drizzle-orm";

async function main() {
  try {
    console.log("Checking for pgvector extension...");
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
    console.log("SUCCESS: pgvector extension is enabled.");
    process.exit(0);
  } catch (err) {
    console.error("FAILED to enable extension:", err.message);
    console.error("Please make sure you have pgvector installed and the DB user has superuser privileges.");
    process.exit(1);
  }
}

main();
