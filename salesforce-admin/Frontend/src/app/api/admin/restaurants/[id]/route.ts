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
        categories: {
          include: {
            items: true,
          },
        },
        menuItems: {
          include: {
            category: true,
          },
        },
        tables: {
          include: {
            qrCode: true,
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

    if (!r || r.deletedAt) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const primaryTable = r.tables.find((t) => t.qrCode?.token) || r.tables[0];
    const totalScans = r.tables.reduce((acc, t) => acc + (t.qrCode?.scansTotal || 0), 0);
    const todayScans = Math.round(totalScans * 0.15);
    const adminUser = r.memberships[0]?.user;

    const statusNormalized =
      r.status === 'ACTIVE' ? 'active' : r.status === 'SUSPENDED' ? 'suspended' : 'setup';

    const restaurant = {
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

      // Employee Attribution
      salesExecutiveName: r.salesExecutiveName || r.createdBy?.name || 'Field Operations',
      salesExecutiveCode: r.salesExecutiveCode || r.createdBy?.employeeId || 'EMP',
      salesExecutiveEmail: r.salesExecutiveEmail || r.createdBy?.email || '—',
      salesExecutivePhone: r.salesExecutivePhone || '',
      salesNotes: r.salesNotes || '',
      leadSource: r.leadSource || 'Field Visit',
      onboardingSource: r.onboardingSource || 'SALES_EXECUTIVE',
      salesExecutiveTerritory: r.createdBy?.territory || 'Unassigned',

      // Counts and Collections
      foodItems: r.menuItems.map((item) => ({
        id: item.id,
        _id: item.id,
        name: item.name,
        price: Number(item.price),
        category: item.category?.name || 'Uncategorized',
        available: item.available,
        foodType: item.foodType,
        imageUrl: item.imageUrl,
        description: item.description,
      })),
      categories: r.categories.map((c) => ({
        id: c.id,
        _id: c.id,
        name: c.name,
        itemCount: c.items.length,
      })),
      tables: r.tables.map((t) => ({
        id: t.id,
        label: t.label,
        qrToken: t.qrCode?.token || null,
        scansTotal: t.qrCode?.scansTotal || 0,
        status: t.qrCode?.status || 'ACTIVE',
      })),

      dishes: r.menuItems.length,
      tableCount: r.tables.length,
      todayScans,
      totalScans,

      adminUsers: adminUser
        ? [{ id: adminUser.id, name: adminUser.name, email: adminUser.email, role: 'restaurant_admin' }]
        : [],
      adminEmail: adminUser?.email || r.email || '',

      qrToken: primaryTable?.qrCode?.token || null,
      menuUrl: primaryTable?.qrCode?.token
        ? `http://localhost:3000/menu/${primaryTable.qrCode.token}`
        : `http://localhost:3000/menu/${r.slug}`,
    };

    return NextResponse.json({
      success: true,
      restaurant,
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await currentUser();
    if (!actor || (actor.role !== 'SUPER_ADMIN' && actor.role !== 'COMPANY_ADMIN')) {
      return NextResponse.json({ error: 'Super Admin privileges required' }, { status: 403 });
    }
    const { id } = await params;
    const body = await req.json();

    const updated = await db.restaurant.update({
      where: { id },
      data: {
        name: body.name || undefined,
        description: body.description || undefined,
        phone: body.phone || undefined,
        address: body.address || undefined,
        cuisine: body.cuisineType ? [body.cuisineType] : undefined,
      },
    });

    return NextResponse.json({ success: true, restaurant: updated });
  } catch (err) {
    return jsonError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const actor = await currentUser();
    if (!actor || (actor.role !== 'SUPER_ADMIN' && actor.role !== 'COMPANY_ADMIN')) {
      return NextResponse.json({ error: 'Super Admin privileges required' }, { status: 403 });
    }
    const { id } = await params;
    await db.restaurant.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ success: true, message: 'Restaurant deleted' });
  } catch (err) {
    return jsonError(err);
  }
}
