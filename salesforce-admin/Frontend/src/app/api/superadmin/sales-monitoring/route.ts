import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { jsonError } from '@/lib/http';
import { UserRole } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const actor = await currentUser();
    // Allow if superadmin or company admin or if external system with header
    const authHeader = req.headers.get('x-superadmin-key');
    const isSuperAdminUser = actor && (actor.role === UserRole.SUPER_ADMIN || actor.role === UserRole.COMPANY_ADMIN);
    const isValidKey = authHeader && authHeader === process.env.SESSION_SECRET;

    if (!isSuperAdminUser && !isValidKey) {
      return NextResponse.json(
        { error: 'Forbidden. Super Admin privileges required.' },
        { status: 403 }
      );
    }

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [salesExecutives, allRestaurants, recentAuditLogs, totalRestaurants, thisMonthCount] = await Promise.all([
      db.user.findMany({
        where: { role: UserRole.SALES_EXECUTIVE },
        orderBy: { name: 'asc' },
        include: {
          createdRestaurants: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              name: true,
              slug: true,
              city: true,
              email: true,
              phone: true,
              status: true,
              leadSource: true,
              salesNotes: true,
              createdAt: true,
              _count: { select: { tables: true, menuItems: true } },
            },
          },
        },
      }),
      db.restaurant.findMany({
        where: { deletedAt: null },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          cuisine: true,
          city: true,
          email: true,
          phone: true,
          status: true,
          salesExecutiveName: true,
          salesExecutiveEmail: true,
          salesExecutiveCode: true,
          salesNotes: true,
          leadSource: true,
          onboardingSource: true,
          createdAt: true,
          _count: { select: { tables: true, menuItems: true } },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeId: true,
              territory: true,
            },
          },
        },
      }),
      db.auditLog.findMany({
        where: { action: { startsWith: 'restaurant.onboarded' } },
        orderBy: { createdAt: 'desc' },
        take: 25,
        include: {
          actor: { select: { id: true, name: true, email: true, employeeId: true, role: true } },
          restaurant: { select: { id: true, name: true, city: true } },
        },
      }),
      db.restaurant.count({ where: { deletedAt: null } }),
      db.restaurant.count({ where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    const executiveLeaderboard = salesExecutives.map((exec) => {
      const totalOnboarded = exec.createdRestaurants.length;
      const activeCount = exec.createdRestaurants.filter((r) => r.status === 'ACTIVE').length;
      const recentOnboarding = exec.createdRestaurants[0] || null;

      return {
        id: exec.id,
        name: exec.name,
        email: exec.email,
        employeeId: exec.employeeId || '—',
        territory: exec.territory || 'Unassigned',
        status: exec.status,
        lastLoginAt: exec.lastLoginAt,
        totalOnboarded,
        activeCount,
        recentOnboarding,
        restaurants: exec.createdRestaurants.map((r) => ({
          id: r.id,
          name: r.name,
          city: r.city,
          status: r.status,
          leadSource: r.leadSource,
          salesNotes: r.salesNotes,
          createdAt: r.createdAt,
          tablesCount: r._count.tables,
        })),
      };
    });

    return NextResponse.json({
      summary: {
        totalSalesExecutives: salesExecutives.length,
        totalRestaurants,
        onboardingsThisMonth: thisMonthCount,
        activeRestaurants: allRestaurants.filter((r) => r.status === 'ACTIVE').length,
      },
      leaderboard: executiveLeaderboard,
      restaurants: allRestaurants,
      recentAuditLogs,
    });
  } catch (error) {
    return jsonError(error);
  }
}
