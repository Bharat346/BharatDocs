import { db } from "./index.js";
import { tags, docs, notes, blogs, docTags, noteTags, blogTags, notifications } from "./schema.js";
import fs from "fs";
import csv from "csv-parser";

const CSV_PATH = new URL("nodes_rows.csv", import.meta.url).pathname;

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function seed() {
  console.log("🌱 Migrating data and seeding database...");

  try {
    /* ── Clean ── */
    await db.delete(docTags);
    await db.delete(noteTags);
    await db.delete(blogTags);
    await db.delete(docs);
    await db.delete(notes);
    await db.delete(blogs);
    await db.delete(notifications);
    await db.delete(tags);

    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });

    console.log(`Parsed ${rows.length} rows from CSV`);

    const tagsMap = new Map(); // tagName -> tagId
    const docsToInsert = [];
    const notesToInsert = [];
    const docTagsToInsert = [];
    const noteTagsToInsert = [];

    const allTagNames = new Set();
    for (const row of rows) {
      if (row.tags && row.tags !== '[]') {
        try {
          const parsed = JSON.parse(row.tags);
          if (Array.isArray(parsed)) {
            for (const t of parsed) {
              if (t) allTagNames.add(t.trim());
            }
          }
        } catch (e) {}
      }
    }

    const uniqueTags = new Map(); // slug -> name
    for (const tagName of allTagNames) {
      const slug = slugify(tagName);
      if (!uniqueTags.has(slug)) {
        uniqueTags.set(slug, tagName);
      }
    }

    const insertedTags = new Map(); // slug -> id
    for (const [slug, name] of uniqueTags.entries()) {
      const [inserted] = await db.insert(tags).values({ name, slug }).returning();
      insertedTags.set(slug, inserted.id);
    }

    for (const row of rows) {
      const isDocs = row.collection_id === '9431f8a2-0ced-4458-acfa-b0e684e740a5';
      const isNotes = row.collection_id === '6f1d3544-98b3-41e6-988e-fd614805c201';

      if (!isDocs && !isNotes) {
        console.log(`Skipping row ${row.id} - Unknown collection_id: ${row.collection_id}`);
        continue;
      }

      const parentId = row.parent_id && row.parent_id.trim() !== '' ? row.parent_id : null;
      
      let rowTags = [];
      if (row.tags && row.tags !== '[]') {
        try {
          const parsed = JSON.parse(row.tags);
          if (Array.isArray(parsed)) {
            rowTags = parsed.map(t => t ? slugify(t.trim()) : null).filter(slug => slug && insertedTags.has(slug)).map(slug => insertedTags.get(slug));
          }
        } catch(e) {}
      }

      const createdAt = row.created_at ? new Date(row.created_at) : new Date();
      const updatedAt = row.updated_at ? new Date(row.updated_at) : new Date();

      if (isDocs) {
        const type = row.node_type === 'doc' ? 'document' : 'folder';
        let fileType = row.file_type && row.file_type.trim() !== '' ? row.file_type : null;
        if (fileType && !['mdx', 'pdf', 'docx'].includes(fileType)) fileType = null;

        docsToInsert.push({
          id: row.id,
          parentId,
          name: row.name,
          slug: row.slug,
          type,
          filePath: row.file_path && row.file_path.trim() !== '' ? row.file_path : null,
          fileType,
          orderIndex: parseInt(row.order_index) || 0,
          isPublished: row.is_published === 'true',
          createdAt,
          updatedAt,
        });

        const uniqueTagsForRow = [...new Set(rowTags)];
        for (const tagId of uniqueTagsForRow) {
          docTagsToInsert.push({
            docId: row.id,
            tagId
          });
        }
      } else if (isNotes) {
        const type = row.node_type === 'note' ? 'note' : 'folder';
        let fileType = row.file_type && row.file_type.trim() !== '' ? row.file_type : null;
        if (fileType && !['mdx', 'pdf', 'docx'].includes(fileType)) fileType = null;

        notesToInsert.push({
          id: row.id,
          parentId,
          name: row.name,
          slug: row.slug,
          type,
          filePath: row.file_path && row.file_path.trim() !== '' ? row.file_path : null,
          fileType,
          fileSize: row.file_size && row.file_size.trim() !== '' ? parseInt(row.file_size) : null,
          orderIndex: parseInt(row.order_index) || 0,
          isPublished: row.is_published === 'true',
          createdAt,
          updatedAt,
        });

        const uniqueTagsForRow = [...new Set(rowTags)];
        for (const tagId of uniqueTagsForRow) {
          noteTagsToInsert.push({
            noteId: row.id,
            tagId
          });
        }
      }
    }

    if (docsToInsert.length > 0) {
      await db.insert(docs).values(docsToInsert);
    }
    if (notesToInsert.length > 0) {
      await db.insert(notes).values(notesToInsert);
    }
    if (docTagsToInsert.length > 0) {
      await db.insert(docTags).values(docTagsToInsert);
    }
    if (noteTagsToInsert.length > 0) {
      await db.insert(noteTags).values(noteTagsToInsert);
    }

    const blogsCSVPath = new URL("blogs_rows.csv", import.meta.url).pathname;
    const blogRows = [];
    if (fs.existsSync(blogsCSVPath)) {
      await new Promise((resolve, reject) => {
        fs.createReadStream(blogsCSVPath)
          .pipe(csv())
          .on("data", (data) => blogRows.push(data))
          .on("end", () => resolve())
          .on("error", (err) => reject(err));
      });
      console.log(`Parsed ${blogRows.length} rows from blogs CSV`);

      const blogsToInsert = [];
      const blogTagsToInsert = [];

      for (const row of blogRows) {
        let rowTags = [];
        if (row.tags && row.tags !== '[]') {
          try {
            const parsed = JSON.parse(row.tags);
            if (Array.isArray(parsed)) {
              for (const t of parsed) {
                if (t) {
                  const tagSlug = slugify(t.trim());
                  let tagId = insertedTags.get(tagSlug);
                  if (!tagId) {
                    const [inserted] = await db.insert(tags).values({ name: t.trim(), slug: tagSlug }).returning();
                    insertedTags.set(tagSlug, inserted.id);
                    tagId = inserted.id;
                  }
                  rowTags.push(tagId);
                }
              }
            }
          } catch(e) {}
        }

        blogsToInsert.push({
          id: row.id,
          slug: row.slug,
          title: row.title,
          description: row.description,
          coverImage: row.cover_image,
          githubPath: row.github_path,
          author: row.author,
          readTime: parseInt(row.read_time) || 5,
          isPublished: row.is_published === 'true',
          isFeatured: row.is_featured === 'true',
          publishedAt: row.published_at ? new Date(row.published_at) : new Date(),
          createdAt: row.created_at ? new Date(row.created_at) : new Date(),
          updatedAt: row.updated_at ? new Date(row.updated_at) : new Date(),
        });

        const uniqueTagsForRow = [...new Set(rowTags)];
        for (const tagId of uniqueTagsForRow) {
          blogTagsToInsert.push({
            blogId: row.id,
            tagId
          });
        }
      }

      if (blogsToInsert.length > 0) {
        await db.insert(blogs).values(blogsToInsert);
      }
      if (blogTagsToInsert.length > 0) {
        await db.insert(blogTags).values(blogTagsToInsert);
      }
    }

    /* ── Notifications ── */
    const twoDaysFromNow = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    await db.insert(notifications).values({
      title: "Welcome to BharatDocs!",
      message: "Explore our documentation, notes, and blog posts.",
      type: "system",
      url: "/",
      expiresAt: twoDaysFromNow,
    });

    console.log(`✅ Migrated ${docsToInsert.length} docs and ${notesToInsert.length} notes!`);
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    process.exit(0);
  }
}

seed();
