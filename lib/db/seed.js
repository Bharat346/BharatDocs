import { db } from "./index.js";
import { collections, nodes } from "./schema.js";

async function seed() {
  console.log("🌱 Seeding database...");

  try {
    /* =======================
       CLEAN
    ======================= */
    await db.delete(nodes);
    await db.delete(collections);

    /* =======================
       COLLECTIONS
    ======================= */
    const [docsCol] = await db
      .insert(collections)
      .values({
        name: "Docs",
        orderIndex: 0,
      })
      .returning();

    const [notesCol] = await db
      .insert(collections)
      .values({
        name: "Notes",
        orderIndex: 1,
      })
      .returning();

    /* =======================
       DOCS TREE
    ======================= */

    // Root Folder
    const [nodeJs] = await db
      .insert(nodes)
      .values({
        collectionId: docsCol.id,
        name: "Node.js",
        nodeType: "folder",
        orderIndex: 0,
        isPublished: true,
      })
      .returning();

    // Docs under Node.js
    await db.insert(nodes).values([
      {
        collectionId: docsCol.id,
        parentId: nodeJs.id,
        parentName: "Node.js",
        name: "Introduction",
        slug: "introduction",
        nodeType: "doc",
        filePath: "docs/nodejs/introduction.mdx",
        fileType: "mdx",
        fileSize: 1200,
        orderIndex: 0,
        isPublished: true,
      },
      {
        collectionId: docsCol.id,
        parentId: nodeJs.id,
        parentName: "Node.js",
        name: "Event Loop",
        slug: "event-loop",
        nodeType: "doc",
        filePath: "docs/nodejs/event-loop.mdx",
        fileType: "mdx",
        fileSize: 2400,
        orderIndex: 1,
        isPublished: true,
      },
    ]);

    /* =======================
       NOTES TREE
    ======================= */

    // Semester Folder
    const [sem5] = await db
      .insert(nodes)
      .values({
        collectionId: notesCol.id,
        name: "Semester 5",
        nodeType: "folder",
        orderIndex: 0,
        isPublished: true,
      })
      .returning();

    // Subject Folder
    const [ml] = await db
      .insert(nodes)
      .values({
        collectionId: notesCol.id,
        parentId: sem5.id,
        parentName: "Semester 5",
        name: "Machine Learning",
        nodeType: "folder",
        orderIndex: 0,
        isPublished: true,
      })
      .returning();

    // Notes
    await db.insert(nodes).values([
      {
        collectionId: notesCol.id,
        parentId: ml.id,
        parentName: "Machine Learning",
        name: "Unit 1 – Basics",
        nodeType: "note",
        filePath: "notes/semester-5/ml/unit-1.pdf",
        fileType: "pdf",
        fileSize: 550000,
        orderIndex: 0,
        isPublished: true,
      },
      {
        collectionId: notesCol.id,
        parentId: ml.id,
        parentName: "Machine Learning",
        name: "Unit 2 – Regression",
        nodeType: "note",
        filePath: "notes/semester-5/ml/unit-2.docx",
        fileType: "docx",
        fileSize: 320000,
        orderIndex: 1,
        isPublished: true,
      },
    ]);

    console.log("✅ Seeding complete!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    process.exit(0);
  }
}

seed();
