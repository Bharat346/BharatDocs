import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const globalForPostgres = globalThis;
const client =
  globalForPostgres.__pg || postgres(process.env.DATABASE_URL, { max: 10 });

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.__pg = client;
}

export const db = drizzle(client, { schema });
