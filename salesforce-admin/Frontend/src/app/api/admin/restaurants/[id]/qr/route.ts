import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
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
      },
    });

    if (!r) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    const primaryTable = r.tables.find((t) => t.qrCode?.token) || r.tables[0];
    const token = primaryTable?.qrCode?.token || r.slug;
    const customerBase = (process.env.NEXT_PUBLIC_CUSTOMER_URL || 'https://customermenu.scanzaa.in').replace(/\/+$/, '');
    const menuUrl = `${customerBase}/menu/${token}`;

    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 320,
      margin: 2,
      color: { dark: '#0b1730', light: '#ffffff' },
    });

    return NextResponse.json({
      success: true,
      qrDataUrl,
      menuUrl,
      tableLabel: primaryTable?.label || 'Main Dining',
    });
  } catch (err) {
    return jsonError(err);
  }
}
