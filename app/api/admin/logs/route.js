// app/api/admin/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/index";
import {
  accessLogs,
  securityEvents,
  rateLimits,
  visitors,
} from "@/lib/db/schema";
import { desc, gte, and, eq, sql } from "drizzle-orm";

// Helper to format date for SQL
const getDateRange = (days) => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

export async function GET(request) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get("timeRange") || "7d";
    const limit = parseInt(searchParams.get("limit") || "100");

    // Calculate date range
    let startDate = new Date();
    switch (timeRange) {
      case "1d":
        startDate.setDate(startDate.getDate() - 1);
        break;
      case "7d":
        startDate.setDate(startDate.getDate() - 7);
        break;
      case "30d":
        startDate.setDate(startDate.getDate() - 30);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // Fetch all data in parallel
    const [
      securityEventsData,
      accessLogsData,
      rateLimitsData,
      visitorsData,
      statsData,
      hourlyStats,
      topIPs,
    ] = await Promise.all([
      // Security Events
      db
        .select()
        .from(securityEvents)
        .where(gte(securityEvents.createdAt, startDate))
        .orderBy(desc(securityEvents.createdAt))
        .limit(limit),

      // Access Logs
      db
        .select()
        .from(accessLogs)
        .where(gte(accessLogs.accessedAt, startDate))
        .orderBy(desc(accessLogs.accessedAt))
        .limit(limit),

      // Rate Limits
      db
        .select()
        .from(rateLimits)
        .where(
          and(
            eq(rateLimits.isBlocked, true),
            gte(rateLimits.createdAt, startDate),
          ),
        )
        .orderBy(desc(rateLimits.createdAt))
        .limit(limit),

      // Visitors
      db.select().from(visitors).orderBy(desc(visitors.lastSeen)).limit(100),

      // Statistics
      db
        .select({
          totalSecurityEvents: sql`COUNT(${securityEvents.id})`,
          criticalEvents: sql`COUNT(CASE WHEN ${securityEvents.severity} = 'critical' THEN 1 END)`,
          uniqueIPs: sql`COUNT(DISTINCT ${securityEvents.ipAddress})`,
          todayEvents: sql`COUNT(CASE WHEN ${securityEvents.createdAt} > CURRENT_DATE THEN 1 END)`,
          blockedIPs: sql`COUNT(DISTINCT CASE WHEN ${rateLimits.isBlocked} = true THEN ${rateLimits.key} END)`,
        })
        .from(securityEvents)
        .leftJoin(rateLimits, eq(rateLimits.key, securityEvents.ipAddress)),

      // Hourly statistics for charts
      db
        .select({
          hour: sql`EXTRACT(HOUR FROM ${securityEvents.createdAt})`,
          count: sql`COUNT(*)`,
        })
        .from(securityEvents)
        .where(gte(securityEvents.createdAt, startDate))
        .groupBy(sql`EXTRACT(HOUR FROM ${securityEvents.createdAt})`)
        .orderBy(sql`EXTRACT(HOUR FROM ${securityEvents.createdAt})`),

      // Top IPs by event count
      db
        .select({
          ipAddress: securityEvents.ipAddress,
          count: sql`COUNT(*)`,
          country: accessLogs.country,
          isSuspicious: sql`
  BOOL_OR(${rateLimits.isBlocked})
`,
        })
        .from(securityEvents)
        .leftJoin(
          accessLogs,
          eq(accessLogs.ipAddress, securityEvents.ipAddress),
        )
        .leftJoin(
          rateLimits,
          and(
            eq(rateLimits.key, securityEvents.ipAddress),
            eq(rateLimits.isBlocked, true),
          ),
        )
        .where(gte(securityEvents.createdAt, startDate))
        .groupBy(securityEvents.ipAddress, accessLogs.country)
        .orderBy(desc(sql`COUNT(*)`))
        .limit(10),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        securityEvents: securityEventsData,
        accessLogs: accessLogsData,
        rateLimits: rateLimitsData,
        visitors: visitorsData,
        stats: statsData[0] || {
          totalSecurityEvents: 0,
          criticalEvents: 0,
          uniqueIPs: 0,
          todayEvents: 0,
          blockedIPs: 0,
        },
        hourlyStats: hourlyStats.map((h) => ({
          hour: parseInt(h.hour),
          count: parseInt(h.count.toString()),
        })),
        topIPs: topIPs.map((ip) => ({
          ipAddress: ip.ipAddress,
          count: parseInt(ip.count.toString()),
          country: ip.country,
          isSuspicious: ip.isSuspicious,
        })),
        summary: {
          totalVisitors: visitorsData.length,
          totalAccessLogs: accessLogsData.length,
          totalBlocked: rateLimitsData.length,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching logs:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch logs" },
      { status: 500 },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case "blockIP": {
        const { ip, duration = 24, reason = "Manual block" } = data;

        await db.insert(rateLimits).values({
          key: ip,
          type: "ip",
          endpoint: "*",
          count: 1000, // Set high count to ensure blocking
          windowStart: new Date(),
          expiresAt: new Date(Date.now() + duration * 60 * 60 * 1000),
          isBlocked: true,
        });

        // Log as security event
        await db.insert(securityEvents).values({
          event: "manual_ip_block",
          severity: "critical",
          ipAddress: ip,
          details: JSON.stringify({ reason, duration }),
        });

        return NextResponse.json({
          success: true,
          message: `IP ${ip} blocked for ${duration} hours`,
        });
      }

      case "unblockIP": {
        const { ip } = data;

        await db
          .update(rateLimits)
          .set({ isBlocked: false })
          .where(and(eq(rateLimits.key, ip), eq(rateLimits.type, "ip")));

        return NextResponse.json({
          success: true,
          message: `IP ${ip} unblocked`,
        });
      }

      case "clearLogs": {
        const { type, days = 30 } = data;
        const cutoffDate = getDateRange(days);

        let deletedCount = 0;

        switch (type) {
          case "security":
            deletedCount = (
              await db
                .delete(securityEvents)
                .where(gte(securityEvents.createdAt, cutoffDate))
            )[0];
            break;
          case "access":
            deletedCount = (
              await db
                .delete(accessLogs)
                .where(gte(accessLogs.accessedAt, cutoffDate))
            )[0];
            break;
          case "all":
            const secCount = (
              await db
                .delete(securityEvents)
                .where(gte(securityEvents.createdAt, cutoffDate))
            )[0];
            const accCount = (
              await db
                .delete(accessLogs)
                .where(gte(accessLogs.accessedAt, cutoffDate))
            )[0];
            deletedCount = secCount + accCount;
            break;
        }

        return NextResponse.json({
          success: true,
          message: `Cleared ${deletedCount} logs older than ${days} days`,
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: "Invalid action" },
          { status: 400 },
        );
    }
  } catch (error) {
    console.error("Error processing admin action:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process action" },
      { status: 500 },
    );
  }
}
