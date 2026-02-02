// api/admin/ip-management/route.js
import { NextResponse } from 'next/server';
import { db } from '@/lib/db/index';
import { rateLimits } from '@/lib/db/schema';
import { accessLogs } from '@/lib/db/schema';
import { eq, desc, sql, and, gt } from 'drizzle-orm';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    if (type === 'blocked') {
      // Get blocked IPs from rate_limits table
      const blockedIPs = await db
        .select()
        .from(rateLimits)
        .where(
          and(
            eq(rateLimits.isBlocked, true),
            gt(rateLimits.expiresAt, new Date())
          )
        )
        .orderBy(desc(rateLimits.createdAt));
        console.log(blockedIPs);

      return NextResponse.json({ success: true, data: blockedIPs });
    }

    if (type === 'top') {
      // Get top IPs from access logs (you'll need an access_logs table)
      const topIPs = await db
        .select({
          ipAddress,
          country,
          count,
          lastSeen,
          isSuspicious,
        })
        .from(accessLogs)
        // .where(gt(access_logs.accessed_at, new Date() - 7 * 24 * 60 * 60 * 1000))
        // .groupBy(access_logs.ip_address, access_logs.country)
        // .orderBy(desc(access_logs.count))
        .limit(50);

      console.log(topIPs);

      return NextResponse.json({ success: true, data: topIPs });
    }

    return NextResponse.json({ success: false, error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { action, ip, duration, reason } = await request.json();

    if (action === 'block') {
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + (duration || 24));

      await db.insert(rateLimits).values({
        key: ip,
        type: 'ip',
        isBlocked: true,
        expiresAt,
        count: 1,
        windowStart: new Date(),
        createdAt: new Date(),
      });

      return NextResponse.json({ success: true, message: `IP ${ip} blocked` });
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const { ip } = await request.json();

    // Unblock IP by setting isBlocked to false
    await db
      .update(rateLimits)
      .set({ isBlocked: false })
      .where(eq(rateLimits.key, ip));

    return NextResponse.json({ success: true, message: `IP ${ip} unblocked` });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}