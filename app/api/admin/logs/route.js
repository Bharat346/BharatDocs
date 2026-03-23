import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  accessLogs,
  securityEvents,
  rateLimits,
  visitors,
  auditLogs,
} from "@/lib/db/schema";
import { desc, gte, and, eq, sql } from "drizzle-orm";

/* ------------------ Utils ------------------ */

const getStartDate = (timeRange) => {
  const date = new Date();
  if (timeRange === "1d") date.setDate(date.getDate() - 1);
  else if (timeRange === "30d") date.setDate(date.getDate() - 30);
  else if (timeRange === "all") return new Date(0); // beginning of time
  else date.setDate(date.getDate() - 7);
  return date;
};

/* ------------------ Queries ------------------ */

// 1. Security Events (list)
const getSecurityEvents = (limit, offset) =>
  db
    .select()
    .from(securityEvents)
    .orderBy(desc(securityEvents.createdAt))
    .limit(limit)
    .offset(offset);

// 2. Access Logs
const getAccessLogs = (filters, limit, offset) =>
  db
    .select()
    .from(accessLogs)
    .where(and(...filters))
    .orderBy(desc(accessLogs.accessedAt))
    .limit(limit)
    .offset(offset);

// 3. Rate Limits
const getRateLimits = (startDate, limit) =>
  db
    .select()
    .from(rateLimits)
    .where(
      and(eq(rateLimits.isBlocked, true), gte(rateLimits.createdAt, startDate))
    )
    .orderBy(desc(rateLimits.createdAt))
    .limit(limit);

// 4. Visitors
const getVisitors = () =>
  db.select().from(visitors).orderBy(desc(visitors.lastSeen)).limit(100);

// 5. Security Stats (NO JOIN)
const getSecurityStats = () =>
  db
    .select({
      totalSecurityEvents: sql`COUNT(*)`,
      criticalEvents: sql`COUNT(CASE WHEN ${securityEvents.severity} = 'critical' THEN 1 END)`,
      uniqueIPs: sql`COUNT(DISTINCT ${securityEvents.ipAddress})`,
      todayEvents: sql`COUNT(CASE WHEN ${securityEvents.createdAt} > CURRENT_DATE THEN 1 END)`,
    })
    .from(securityEvents);

// 6. Blocked IPs (separate query)
const getBlockedIPs = (startDate) =>
  db
    .select({
      count: sql`COUNT(DISTINCT ${rateLimits.key})`,
    })
    .from(rateLimits)
    .where(
      and(eq(rateLimits.isBlocked, true), gte(rateLimits.createdAt, startDate))
    );

// 7. Hourly stats
const getHourlyStats = (startDate) =>
  db
    .select({
      hour: sql`EXTRACT(HOUR FROM ${securityEvents.createdAt})`,
      count: sql`COUNT(*)`,
    })
    .from(securityEvents)
    .where(gte(securityEvents.createdAt, startDate))
    .groupBy(sql`EXTRACT(HOUR FROM ${securityEvents.createdAt})`)
    .orderBy(sql`EXTRACT(HOUR FROM ${securityEvents.createdAt})`);

// 8. Event types
const getEventTypes = (startDate) =>
  db
    .select({
      type: securityEvents.event,
      count: sql`COUNT(*)`,
    })
    .from(securityEvents)
    .where(gte(securityEvents.createdAt, startDate))
    .groupBy(securityEvents.event)
    .orderBy(desc(sql`COUNT(*)`));

// 9. Top IPs (optimized)
const getTopIPs = (startDate) =>
  db
    .select({
      ipAddress: securityEvents.ipAddress,
      count: sql`COUNT(*)`,
    })
    .from(securityEvents)
    .where(gte(securityEvents.createdAt, startDate))
    .groupBy(securityEvents.ipAddress)
    .orderBy(desc(sql`COUNT(*)`))
    .limit(10);

// 10. Counts
const getCounts = (startDate, filters) =>
  Promise.all([
    db
      .select({ count: sql`count(*)` })
      .from(accessLogs)
      .where(and(...filters)),

    db
      .select({ count: sql`count(*)` })
      .from(securityEvents),

    db
      .select({ count: sql`count(*)` })
      .from(auditLogs),
  ]);

/* ------------------ Route ------------------ */

export async function GET(req) {
  try {
    const params = new URL(req.url).searchParams;

    const timeRange = params.get("timeRange") || "7d";
    const limit = parseInt(params.get("limit") || "50");
    const page = parseInt(params.get("page") || "1");
    const offset = (page - 1) * limit;

    const searchPath = params.get("path");
    const searchIp = params.get("ip");

    const startDate = getStartDate(timeRange);

    const filters = [gte(accessLogs.accessedAt, startDate)];
    if (searchPath)
      filters.push(sql`${accessLogs.path} ILIKE ${"%" + searchPath + "%"}`);
    if (searchIp) filters.push(sql`${accessLogs.ipAddress} ILIKE ${"%" + searchIp + "%"}`);

    /* ---------- Fast queries ---------- */
    const [
      securityEventsData,
      accessLogsData,
      rateLimitsData,
      visitorsData,
    ] = await Promise.all([
      getSecurityEvents(limit, offset),
      getAccessLogs(filters, limit, offset),
      getRateLimits(startDate, limit),
      getVisitors(),
    ]);

    /* ---------- Analytics (heavy but filtered) ---------- */
    const [
      statsData,
      blockedIPs,
      hourlyStats,
      eventTypes,
      topIPs,
      [accessCount, securityCount, auditCount],
    ] = await Promise.all([
      getSecurityStats(startDate),
      getBlockedIPs(startDate),
      getHourlyStats(startDate),
      getEventTypes(startDate),
      getTopIPs(startDate),
      getCounts(startDate, filters),
    ]);

    /* ---------- Format ---------- */

    const stats = {
      ...statsData[0],
      blockedIPs: blockedIPs[0].count,
    };

    const totalAccess = parseInt(accessCount[0].count);
    const totalSecurity = parseInt(securityCount[0].count);
    const totalAudit = parseInt(auditCount[0].count);

    return NextResponse.json({
      success: true,
      data: {
        securityEvents: securityEventsData,
        accessLogs: accessLogsData,
        rateLimits: rateLimitsData,
        visitors: visitorsData,
        stats,
        hourlyStats,
        eventTypes,
        topIPs,
        pagination: {
          totalAccess,
          totalSecurity,
          totalAudit,
          page,
          limit,
          totalPagesAccess: Math.ceil(totalAccess / limit),
          totalPagesSecurity: Math.ceil(totalSecurity / limit),
        },
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch logs" },
      { status: 500 }
    );
  }
}

export async function DELETE(req) {
  try {
    const { type, ids } = await req.json();

    if (!type || !ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { success: false, error: "Invalid request: type and ids required" },
        { status: 400 }
      );
    }

    let table;
    if (type === "access") table = accessLogs;
    else if (type === "security") table = securityEvents;
    else {
      return NextResponse.json(
        { success: false, error: "Invalid type: must be 'access' or 'security'" },
        { status: 400 }
      );
    }

    await db.delete(table).where(sql`${table.id} IN ${ids}`);

    return NextResponse.json({
      success: true,
      message: `Deleted ${ids.length} ${type} log${ids.length > 1 ? 's' : ''}`,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, error: "Failed to delete logs" },
      { status: 500 }
    );
  }
}