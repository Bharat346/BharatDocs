import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { notes } from './lib/db/schema.js';
import { eq } from 'drizzle-orm';
import dotenv from 'dotenv';
dotenv.config();

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function main() {
  const result = await db.select().from(notes).where(eq(notes.fileType, 'pdf')).limit(2);
  console.log(result.map(r => r.filePath));
  process.exit(0);
}
main();
