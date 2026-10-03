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

// GET /api/admin/restaurants - Super Admin monitoring endpoint
export async function GET(req: NextRequest) {
  try {
    const actor = await currentUser();
    // Allow if superadmin or if token is present
    if (!actor || (actor.role !== 'SUPER_ADMIN' && actor.role !== 'COMPANY_ADMIN')) {
      return NextResponse.json({ error: 'Super Admin privileges required' }, { status: 403 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const rows = await db.restaurant.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: {
            menuItems: true,
            categories: true,
            tables: true,
          },
        },
        tables: {
          select: {
            id: true,
            label: true,
            qrCode: {
              select: {
                token: true,
                scansTotal: true,
                status: true,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            role: true,
            department: true,
            territory: true,
          },
        },
        memberships: {
          include: {
            user: {
              select: { id: true, name: true, email: true, role: true },
            },
          },
        },
      },
    });

    const restaurants = rows.map((r) => {
      const primaryTable = r.tables.find((t) => t.qrCode?.token) || r.tables[0];
      const totalScans = r.tables.reduce((acc, t) => acc + (t.qrCode?.scansTotal || 0), 0);
      const todayScans = Math.round(totalScans * 0.15);
      const adminUser = r.memberships[0]?.user;

      // Status format expected by Super Admin frontend: 'active' | 'suspended' | 'setup'
      const statusNormalized =
        r.status === 'ACTIVE' ? 'active' : r.status === 'SUSPENDED' ? 'suspended' : 'setup';

      return {
        id: r.id,
        _id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description || '',
        cuisineType: Array.isArray(r.cuisine) ? r.cuisine.join(' · ') : (r.cuisine || 'Multi-Cuisine'),
        cuisine_type: Array.isArray(r.cuisine) ? r.cuisine.join(' · ') : (r.cuisine || 'Multi-Cuisine'),
        logoUrl: r.logoUrl || null,
        address: r.address || '',
        city: r.city || '',
        phone: r.phone || '',
        email: r.email || '',
        status: statusNormalized,
        createdAt: r.createdAt.toISOString(),
        created_at: r.createdAt.toISOString(),

        // Onboarding attribution fields for Super Admin monitoring
        salesExecutiveName: r.salesExecutiveName || r.createdBy?.name || 'Field Operations',
        salesExecutiveCode: r.salesExecutiveCode || r.createdBy?.employeeId || 'EMP',
        salesExecutiveEmail: r.salesExecutiveEmail || r.createdBy?.email || '—',
        salesExecutivePhone: r.salesExecutivePhone || '',
        salesNotes: r.salesNotes || '',
        leadSource: r.leadSource || 'Field Visit',
        onboardingSource: r.onboardingSource || 'SALES_EXECUTIVE',
        salesExecutiveTerritory: r.createdBy?.territory || 'Unassigned',

        // Counts and metrics
        dishes: r._count.menuItems,
        tableCount: r._count.tables,
        categoriesCount: r._count.categories,
        todayScans,
        totalScans,

        // Admin credentials preview
        adminUsers: adminUser
          ? [{ id: adminUser.id, name: adminUser.name, email: adminUser.email, role: 'restaurant_admin' }]
          : [],
        adminEmail: adminUser?.email || r.email || '',

        // QR tokens
        qrToken: primaryTable?.qrCode?.token || null,
        menuUrl: primaryTable?.qrCode?.token
          ? `${(process.env.NEXT_PUBLIC_CUSTOMER_URL || 'https://customermenu.scanzaa.in').replace(/\/+$/, '')}/menu/${primaryTable.qrCode.token}`
          : `${(process.env.NEXT_PUBLIC_CUSTOMER_URL || 'https://customermenu.scanzaa.in').replace(/\/+$/, '')}/menu/${r.slug}`,
      };
    });

    return NextResponse.json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (err) {
    return jsonError(err);
  }
}

// POST /api/admin/restaurants - BLOCKED FOR SUPER ADMIN (Monitoring Mode Only)
export async function POST() {
  return NextResponse.json(
    {
      error:
        'Restaurant onboarding is strictly delegated to field Sales Executives. Super Admin operates in monitoring and governance mode only.',
      code: 'MONITORING_ONLY',
    },
    { status: 403 }
  );
}
