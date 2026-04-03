import {
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  boolean,
  pgEnum,
  check,
  vector,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/* =======================
   ENUMS
======================= */
export const nodeTypeEnum = pgEnum("node_type", ["folder", "doc", "note"]);

export const fileTypeEnum = pgEnum("file_type", ["mdx", "pdf", "docx"]);

export const severityEnum = pgEnum("severity", ["info", "warn", "critical"]);

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
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").unique().notNull(),
  passwordHash: text("password_hash").notNull(),
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
    tags: text("tags")
      .array()
      .default(sql`'{}'`),
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
      sql`${table.fileSize} IS NULL OR ${table.fileSize} <= 31457280`,
    ),
  }),
);

/* =======================
   RATE LIMITING
======================= */
export const rateLimits = pgTable("rate_limits", {
  id: uuid("id").defaultRandom().primaryKey(),
  key: text("key").notNull(), // IP or username
  type: text("type").notNull(), // 'ip', 'global', 'endpoint'
  endpoint: text("endpoint"),
  count: integer("count").default(0).notNull(),
  windowStart: timestamp("window_start").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").defaultNow().notNull(),
  isBlocked: boolean("is_blocked").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

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
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  path: text("path").notNull(),
  method: text("method").notNull(),
  status: text("status").notNull(), // "success" | "blocked" | "rate_limited"
  responseTime: integer("response_time"), // ms
  country: text("country"),
  countryCode: text("country_code"),
  region: text("region"),
  regionName: text("region_name"),
  city: text("city"),
  zip: text("zip"),

  lat: text("lat"),
  lon: text("lon"),
  timezone: text("timezone"),

  isp: text("isp"),
  org: text("org"),
  asn: text("asn"),
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
  severity: severityEnum("severity").default("info").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =======================
   SECURITY EVENTS (FIREWALL)
======================= */
export const securityEvents = pgTable("security_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  event: text("event").notNull(), // e.g., 'rate_limit', 'ip_blocked', 'xss_detect'
  severity: severityEnum("severity").default("warn").notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  path: text("path"),
  method: text("method"),
  details: text("details"), // Stored as stringified JSON for simplicity
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

/* =======================
   DOCUMENT CHUNKS (RAG)
======================= */
export const documentChunks = pgTable("document_chunks", {
  id: uuid("id").defaultRandom().primaryKey(),
  nodeId: uuid("node_id").references(() => nodes.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  embedding: vector("embedding", { dimensions: 512 }),
  metadata: text("metadata"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
