import { Prisma, UserRole } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { requireUser } from '@/lib/auth';
import { jsonError } from '@/lib/http';

const roleByLabel = {
  'Super Admin': UserRole.SUPER_ADMIN,
  'Company Admin': UserRole.COMPANY_ADMIN,
  'Sales Executive': UserRole.SALES_EXECUTIVE,
  'Company Restaurant Manager': UserRole.COMPANY_RESTAURANT_MANAGER,
  'Restaurant Admin': UserRole.RESTAURANT_ADMIN,
  'Restaurant Staff': UserRole.RESTAURANT_STAFF,
} as const;

const permissionKeySchema = z.enum([
  'restaurants.read',
  'restaurants.write',
  'menu.read',
  'menu.write',
  'orders.read',
  'orders.write',
  'reviews.read',
  'reports.read',
  'users.write',
]);

const schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().transform((value) => value.toLowerCase()),
  role: z.enum([
    'Super Admin',
    'Company Admin',
    'Sales Executive',
    'Company Restaurant Manager',
    'Restaurant Admin',
    'Restaurant Staff',
  ]),
  restaurantId: z.string().optional(),
  employeeId: z.string().optional(),
  territory: z.string().optional(),
  permissions: z.array(permissionKeySchema).max(9).default([]),
  password: z.union([z.string().min(6).max(128), z.literal('')]).optional(),
});

const scrypt = async (password: string) => {
  const { randomBytes, scrypt: scryptCallback } = await import('node:crypto');
  const salt = randomBytes(16).toString('hex');
  const hash = await new Promise<Buffer>((resolve, reject) =>
    scryptCallback(password, salt, 64, (error, result) => (error ? reject(error) : resolve(result as Buffer)))
  );
  return `${salt}:${hash.toString('hex')}`;
};

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const actor = await requireUser('users.write');
    const { id } = await context.params;
    const input = schema.parse(await req.json());
    const role = roleByLabel[input.role];

    const perms = [...input.permissions];
    if (role === UserRole.SALES_EXECUTIVE) {
      if (!perms.includes('restaurants.read')) perms.push('restaurants.read');
      if (!perms.includes('restaurants.write')) perms.push('restaurants.write');
      if (!perms.includes('menu.read')) perms.push('menu.read');
    }

    if (role !== UserRole.COMPANY_ADMIN && role !== UserRole.SALES_EXECUTIVE && perms.length === 0) {
      return NextResponse.json({ error: 'Grant access to at least one page' }, { status: 400 });
    }
    if (role !== UserRole.COMPANY_ADMIN && role !== UserRole.SUPER_ADMIN && role !== UserRole.SALES_EXECUTIVE && !input.restaurantId) {
      return NextResponse.json({ error: 'Choose a restaurant for this role' }, { status: 400 });
    }
    if (
      input.restaurantId &&
      !(await db.restaurant.findFirst({ where: { id: input.restaurantId, deletedAt: null }, select: { id: true } }))
    ) {
      return NextResponse.json({ error: 'The selected restaurant was not found' }, { status: 404 });
    }

    const data = await db.$transaction(async (transaction) => {
      const updated = await transaction.user.update({
        where: { id },
        data: {
          name: input.name,
          email: input.email,
          role,
          employeeId: input.employeeId !== undefined ? input.employeeId : undefined,
          territory: input.territory !== undefined ? input.territory : undefined,
          ...(input.password ? { passwordHash: await scrypt(input.password) } : {}),
        },
      });
      await transaction.restaurantUser.deleteMany({ where: { userId: id } });
      if (input.restaurantId) {
        await transaction.restaurantUser.create({
          data: { userId: id, restaurantId: input.restaurantId, permissions: [] },
        });
      }
      await transaction.roleAssignment.deleteMany({ where: { userId: id } });
      for (const key of perms) {
        const permission = await transaction.permission.upsert({
          where: { key },
          create: { key, description: `Permission to ${key.replace('.', ' ')}` },
          update: {},
        });
        await transaction.roleAssignment.create({ data: { userId: id, permissionId: permission.id } });
      }
      return updated;
    });

    await db.auditLog.create({
      data: { actorId: actor.id, action: 'user.updated', objectType: 'User', objectId: id },
    });
    return NextResponse.json({ id: data.id, name: data.name, email: data.email, role: input.role });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'A member with this email or employee ID already exists' }, { status: 409 });
    }
    return jsonError(error);
  }
}
