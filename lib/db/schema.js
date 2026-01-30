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
      sql`${table.fileSize} IS NULL OR ${table.fileSize} <= 31457280`,
    ),
  }),
);

/* =======================
   ACCESS LOGS
======================= */
// Add these to your existing schema

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
   FINGERPRINTING
======================= */
export const fingerprints = pgTable("fingerprints", {
  id: uuid("id").defaultRandom().primaryKey(),
  fingerprint: text("fingerprint").unique().notNull(),
  username: text("username").references(() => visitors.username),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  canvasHash: text("canvas_hash"),
  webglHash: text("webgl_hash"),
  fontsHash: text("fonts_hash"),
  screenHash: text("screen_hash"),
  isSuspicious: boolean("is_suspicious").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
});

// Enhanced accessLogs with more details
export const accessLogs = pgTable("access_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").references(() => visitors.username, {
    onDelete: "set null",
  }),
  nodeId: uuid("node_id").references(() => nodes.id, {
    onDelete: "cascade",
  }),
  fingerprintId: uuid("fingerprint_id").references(() => fingerprints.id),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  path: text("path").notNull(),
  method: text("method").notNull(),
  statusCode: integer("status_code"),
  responseTime: integer("response_time"), // ms
  country: text("country"),
  city: text("city"),
  isp: text("isp"),
  isTor: boolean("is_tor").default(false),
  isVpn: boolean("is_vpn").default(false),
  isProxy: boolean("is_proxy").default(false),
  isDatacenter: boolean("is_datacenter").default(false),
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
