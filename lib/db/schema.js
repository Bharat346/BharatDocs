import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  pgEnum,
  primaryKey,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* =======================
   ENUMS
======================= */
export const docTypeEnum = pgEnum("doc_type", ["folder", "document"]);
export const noteTypeEnum = pgEnum("note_type", ["folder", "note"]);
export const docFileTypeEnum = pgEnum("doc_file_type", ["mdx", "pdf", "docx"]);
export const noteFileTypeEnum = pgEnum("note_file_type", ["mdx", "pdf", "docx"]);

/* =======================
   TAGS (shared, normalized)
======================= */
export const tags = pgTable("tags", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").unique().notNull(),
  slug: text("slug").unique().notNull(),
  color: text("color").default("#3b82f6"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =======================
   DOCS (documentation articles)
======================= */
export const docs = pgTable("docs", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id"),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  type: docTypeEnum("type").notNull(),
  filePath: text("file_path"),
  fileType: docFileTypeEnum("file_type"),
  description: text("description"),
  orderIndex: integer("order_index").default(0).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =======================
   DOC_TAGS (junction)
======================= */
export const docTags = pgTable(
  "doc_tags",
  {
    docId: uuid("doc_id")
      .references(() => docs.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.docId, t.tagId] }),
  }),
);

/* =======================
   NOTES (study notes, PDFs)
======================= */
export const notes = pgTable("notes", {
  id: uuid("id").defaultRandom().primaryKey(),
  parentId: uuid("parent_id"),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  type: noteTypeEnum("type").notNull(),
  filePath: text("file_path"),
  fileType: noteFileTypeEnum("file_type"),
  fileSize: integer("file_size"),
  description: text("description"),
  orderIndex: integer("order_index").default(0).notNull(),
  isPublished: boolean("is_published").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =======================
   NOTE_TAGS (junction)
======================= */
export const noteTags = pgTable(
  "note_tags",
  {
    noteId: uuid("note_id")
      .references(() => notes.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.noteId, t.tagId] }),
  }),
);

/* =======================
   BLOGS
======================= */
export const blogs = pgTable("blogs", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").unique().notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  coverImage: text("cover_image"),
  githubPath: text("github_path").notNull(),
  author: text("author").default("Bharat").notNull(),
  readTime: integer("read_time").default(5),
  isPublished: boolean("is_published").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

/* =======================
   BLOG_TAGS (junction)
======================= */
export const blogTags = pgTable(
  "blog_tags",
  {
    blogId: uuid("blog_id")
      .references(() => blogs.id, { onDelete: "cascade" })
      .notNull(),
    tagId: uuid("tag_id")
      .references(() => tags.id, { onDelete: "cascade" })
      .notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.blogId, t.tagId] }),
  }),
);

/* =======================
   NOTIFICATIONS (auto-expire)
======================= */
export const notifications = pgTable("notifications", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  message: text("message"),
  type: text("type").notNull(),
  url: text("url"),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =======================
   ACCESS LOGS (simplified)
======================= */
export const accessLogs = pgTable("access_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  path: text("path").notNull(),
  method: text("method").notNull(),
  status: text("status").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  responseTime: integer("response_time"),
  accessedAt: timestamp("accessed_at").defaultNow().notNull(),
});
