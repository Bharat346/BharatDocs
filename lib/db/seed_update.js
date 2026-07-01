import { db } from "./index.js";
import { docs, notes, tags, docTags, noteTags } from "./schema.js";
import fs from "fs";
import csv from "csv-parser";

const CSV_PATH = new URL("nodes_rows.csv", import.meta.url).pathname;

const slugify = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function seedUpdate() {
  console.log("🌱 Safely inserting new data into database...");

  try {
    const rows = [];
    await new Promise((resolve, reject) => {
      fs.createReadStream(CSV_PATH)
        .pipe(csv())
        .on("data", (data) => rows.push(data))
        .on("end", () => resolve())
        .on("error", (err) => reject(err));
    });

    console.log(`Parsed ${rows.length} rows from CSV`);
    
    // 1. Gather all tags
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

    // 2. Upsert tags
    for (const tagName of allTagNames) {
      const slug = slugify(tagName);
      try {
        await db.insert(tags).values({ name: tagName, slug }).onConflictDoNothing({ target: tags.slug });
      } catch(e) {
        // Fallback for PG versions without onConflictDoNothing support if necessary
      }
    }

    // 3. Fetch all tags for mapping
    const allTags = await db.select().from(tags);
    const tagsMap = new Map(allTags.map(t => [t.slug, t.id]));

    const docsToInsert = [];
    const notesToInsert = [];
    const docTagsToInsert = [];
    const noteTagsToInsert = [];

    for (const row of rows) {
      const isDocs = row.collection_id === '9431f8a2-0ced-4458-acfa-b0e684e740a5';
      const isNotes = row.collection_id === '6f1d3544-98b3-41e6-988e-fd614805c201';

      if (!isDocs && !isNotes) continue;

      const parentId = row.parent_id && row.parent_id.trim() !== '' ? row.parent_id : null;

      let rowTags = [];
      if (row.tags && row.tags !== '[]') {
        try {
          const parsed = JSON.parse(row.tags);
          if (Array.isArray(parsed)) {
            rowTags = parsed.map(t => t ? slugify(t.trim()) : null).filter(slug => slug && tagsMap.has(slug)).map(slug => tagsMap.get(slug));
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
          docTagsToInsert.push({ docId: row.id, tagId });
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
          noteTagsToInsert.push({ noteId: row.id, tagId });
        }
      }
    }

    console.log(`Upserting ${docsToInsert.length} docs...`);
    if (docsToInsert.length > 0) {
      for (const d of docsToInsert) {
        await db.insert(docs).values(d).onConflictDoUpdate({
          target: docs.id,
          set: {
            parentId: d.parentId,
            name: d.name,
            slug: d.slug,
            type: d.type,
            filePath: d.filePath,
            fileType: d.fileType,
            orderIndex: d.orderIndex,
            isPublished: d.isPublished,
            updatedAt: d.updatedAt
          }
        });
      }
    }

    console.log(`Upserting ${notesToInsert.length} notes...`);
    if (notesToInsert.length > 0) {
      for (const n of notesToInsert) {
        await db.insert(notes).values(n).onConflictDoUpdate({
          target: notes.id,
          set: {
            parentId: n.parentId,
            name: n.name,
            slug: n.slug,
            type: n.type,
            filePath: n.filePath,
            fileType: n.fileType,
            fileSize: n.fileSize,
            orderIndex: n.orderIndex,
            isPublished: n.isPublished,
            updatedAt: n.updatedAt
          }
        });
      }
    }

    console.log(`Updating tags mapping...`);
    if (docTagsToInsert.length > 0) {
      for (const dt of docTagsToInsert) {
        await db.insert(docTags).values(dt).onConflictDoNothing();
      }
    }
    if (noteTagsToInsert.length > 0) {
      for (const nt of noteTagsToInsert) {
        await db.insert(noteTags).values(nt).onConflictDoNothing();
      }
    }

    console.log(`✅ Upserted successfully without clearing older data!`);
  } catch (err) {
    console.error("❌ Seed update failed:", err);
  } finally {
    process.exit(0);
  }
}

seedUpdate();
