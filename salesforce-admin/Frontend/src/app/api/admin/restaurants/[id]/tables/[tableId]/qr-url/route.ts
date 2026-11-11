import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { jsonError } from '@/lib/http';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; tableId: string }> }
) {
  try {
    const actor = await currentUser();
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id, tableId } = await params;
    const body = await req.json();

    const table = await db.diningTable.findUnique({
      where: { id: tableId },
      include: { restaurant: true, qrCode: true },
    });

    if (!table) {
      return NextResponse.json({ error: 'Table not found' }, { status: 404 });
    }

    let cleanUrl = body.customUrl !== undefined ? (body.customUrl ? String(body.customUrl).trim() : null) : undefined;
    if (cleanUrl && !cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const updated = await db.diningTable.update({
      where: { id: tableId },
      data: {
        customUrl: cleanUrl,
        label: body.label !== undefined && String(body.label).trim() ? String(body.label).trim() : undefined,
      },
      include: { restaurant: true, qrCode: true },
    });

    const envUrl = process.env.NEXT_PUBLIC_CUSTOMER_URL?.trim();
    const customerBase = (envUrl && !envUrl.includes('vercel.app') ? envUrl : 'https://customermenu.scanzaa.in').replace(/\/+$/, '');
    const defaultUrl = `${customerBase}/menu/${updated.qrCode?.token || updated.id}`;
    const rawUrl = updated.customUrl || defaultUrl;
    const menuUrl = rawUrl.replace(/https?:\/\/[^/]*vercel\.app/, customerBase);

    const qrDataUrl = await QRCode.toDataURL(menuUrl, {
      width: 480,
      margin: 2,
      color: { dark: '#0b1730', light: '#ffffff' },
    });

    return NextResponse.json({
      success: true,
      table: {
        id: updated.id,
        label: updated.label,
        customUrl: updated.customUrl || null,
        qrToken: updated.qrCode?.token || null,
        qrCode: {
          token: updated.qrCode?.token || updated.id,
          status: updated.qrCode?.status || 'ACTIVE',
          url: menuUrl,
          customUrl: updated.customUrl || null,
          dataUrl: qrDataUrl,
          scansTotal: updated.qrCode?.scansTotal || 0,
        },
      },
      qrCode: {
        token: updated.qrCode?.token || updated.id,
        status: updated.qrCode?.status || 'ACTIVE',
        url: menuUrl,
        customUrl: updated.customUrl || null,
        dataUrl: qrDataUrl,
        scansTotal: updated.qrCode?.scansTotal || 0,
      },
      url: menuUrl,
      menuUrl,
      customUrl: updated.customUrl || null,
      defaultUrl,
      qrDataUrl,
    });
  } catch (err) {
    return jsonError(err);
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string; tableId: string }> }
) {
  return PATCH(req, context);
}
