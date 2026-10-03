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

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
        website: body.customMenuUrl || undefined,
      },
    });

    return NextResponse.json({
      success: true,
      restaurant: updated,
    });
  } catch (err) {
    return jsonError(err);
  }
}
