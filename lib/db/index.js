import * as dotenv from "dotenv";
dotenv.config();

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema.js";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

const globalForPostgres = global;
const client = globalForPostgres.postgres || postgres(process.env.DATABASE_URL);

if (process.env.NODE_ENV !== "production") {
  globalForPostgres.postgres = client;
}

export const db = drizzle(client, { schema });
