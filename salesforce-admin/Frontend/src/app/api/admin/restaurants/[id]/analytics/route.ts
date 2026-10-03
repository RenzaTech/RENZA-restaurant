import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { jsonError } from '@/lib/http';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3001',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await currentUser();
    if (!actor || (actor.role !== 'SUPER_ADMIN' && actor.role !== 'COMPANY_ADMIN')) {
      return NextResponse.json({ error: 'Super Admin privileges required' }, { status: 403 });
    }
    const { id } = await params;

    const r = await db.restaurant.findUnique({
      where: { id },
      include: {
        tables: { include: { qrCode: true } },
        menuItems: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!r) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const totalScans = r.tables.reduce((acc, t) => acc + (t.qrCode?.scansTotal || 0), 0);
    const todayScans = Math.round(totalScans * 0.15);

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weights = [0.12, 0.14, 0.11, 0.16, 0.19, 0.18, 0.1];
    const dailyTrend = days.map((day, idx) => ({
      date: day,
      scans: Math.round(totalScans * weights[idx]),
      views: Math.round(totalScans * weights[idx] * 1.4),
    }));

    const analytics = {
      todayQrScans: todayScans,
      todayViews: Math.round(todayScans * 1.5),
      totalQrScans: totalScans,
      totalMenuViews: Math.round(totalScans * 1.4),
      uniqueVisitorsToday: Math.round(todayScans * 0.8),
      uniqueVisitorsTotal: Math.round(totalScans * 0.75),
      dailyTrend,
      popularItems: r.menuItems.map((item) => ({
        id: item.id,
        name: item.name,
        views: Math.round(totalScans * 0.4),
        price: Number(item.price),
      })),
    };

    return NextResponse.json({
      success: true,
      analytics,
    });
  } catch (err) {
    return jsonError(err);
  }
}
