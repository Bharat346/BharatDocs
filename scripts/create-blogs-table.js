import * as dotenv from "dotenv";
dotenv.config();

import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL);

async function main() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS blogs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        cover_image TEXT,
        github_path TEXT NOT NULL,
        author TEXT DEFAULT 'Bharat' NOT NULL,
        tags TEXT[] DEFAULT '{}',
        read_time INTEGER DEFAULT 5,
        is_published BOOLEAN DEFAULT false NOT NULL,
        is_featured BOOLEAN DEFAULT false NOT NULL,
        published_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT now() NOT NULL,
        updated_at TIMESTAMP DEFAULT now() NOT NULL
      )
    `;
    
    // Create index on slug for fast lookups
    await sql`CREATE INDEX IF NOT EXISTS idx_blogs_slug ON blogs(slug)`;
    
    // Create index on is_published for fast filtering
    await sql`CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(is_published)`;
    
    // Create index on published_at for sorting
    await sql`CREATE INDEX IF NOT EXISTS idx_blogs_published_at ON blogs(published_at DESC)`;
    
    console.log("✅ blogs table created successfully with indexes");
  } catch (e) {
    console.error("❌ Error:", e.message);
  } finally {
    await sql.end();
  }
}

main();
