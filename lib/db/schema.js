import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  pgEnum,
  check,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* =======================
   ENUMS
======================= */
export const nodeTypeEnum = pgEnum("node_type", [
  "folder",
  "doc",
  "note",
]);

export const fileTypeEnum = pgEnum("file_type", [
  "mdx",
  "pdf",
  "docx",
]);

/* =======================
   VISITORS (No login)
======================= */
export const visitors = pgTable("visitors", {
  username: text("username").primaryKey(),
  ipHash: text("ip_hash").notNull(),
  userAgent: text("user_agent"),
  firstSeen: timestamp("first_seen").defaultNow().notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
});

/* =======================
   ADMINS
======================= */
export const admins = pgTable("admins", {
  username: text("username").primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =======================
   COLLECTIONS
======================= */
export const collections = pgTable("collections", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").unique().notNull(),
  orderIndex: integer("order_index").notNull(),
});

/* =======================
   NODES (TREE)
======================= */
export const nodes = pgTable(
  "nodes",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    collectionId: uuid("collection_id").references(() => collections.id),
    parentId: uuid("parent_id"), // self-reference FK added in table callback
    name: text("name").notNull(),
    slug: text("slug"),
    nodeType: nodeTypeEnum("node_type").notNull(),
    filePath: text("file_path"),
    fileType: fileTypeEnum("file_type"),
    fileSize: integer("file_size"),
    parentName: text("parent_name"),
    parentSlug: text("parent_slug"),
    orderIndex: integer("order_index").notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    // Self-referencing FK (parentId -> nodes.id)
    parentFk: {
      columns: [table.parentId],
      foreignColumns: [table.id],
      name: "nodes_parent_fk",
      onDelete: "cascade",
    },
    // File size <= 30MB
    fileSizeCheck: check(
      "file_size_check",
      sql`${table.fileSize} <= 31457280`
    ),
  })
);

/* =======================
   ACCESS LOGS
======================= */
export const accessLogs = pgTable("access_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").references(() => visitors.username, {
    onDelete: "set null",
  }),
  nodeId: uuid("node_id").references(() => nodes.id, {
    onDelete: "cascade",
  }),
  accessedAt: timestamp("accessed_at").defaultNow().notNull(),
});

/* =======================
   AUDIT LOGS
======================= */
export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminUsername: text("admin_username").references(() => admins.username, {
    onDelete: "set null",
  }),
  action: text("action").notNull(),
  nodeId: uuid("node_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});