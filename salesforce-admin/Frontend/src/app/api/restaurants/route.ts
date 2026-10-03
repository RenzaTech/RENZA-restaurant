import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { currentUser, requireAnyPermission, requireUser } from '@/lib/auth';
import { jsonError, pageArgs } from '@/lib/http';
import { UserRole } from '@prisma/client';

const scrypt = promisify(scryptCb);

const createRestaurantSchema = z.object({
  name: z.string().trim().min(2).max(120),
  externalId: z.string().optional(),
  description: z.string().optional(),
  cuisine: z.array(z.string()).default([]),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  website: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().default('India'),
  pincode: z.string().optional(),
  openingTime: z.string().optional(),
  closingTime: z.string().optional(),
  workingDays: z.array(z.string()).default([]),
  logoUrl: z.string().optional(),
  adminName: z.string().trim().optional(),
  adminEmail: z.string().email().optional().or(z.literal('')),
  adminPassword: z.string().optional().or(z.literal('')),
  initialTableCount: z.coerce.number().min(0).max(50).default(5),
  salesNotes: z.string().optional(),
  leadSource: z.string().optional(),
});

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

export async function GET(req: NextRequest) {
  try {
    await requireAnyPermission(
      'restaurants.read',
      'menu.read',
      'orders.read',
      'reviews.read',
      'reports.read',
      'users.write'
    );
    const actor = await currentUser();
    const { page, pageSize, skip } = pageArgs(req.url);
    const q = req.nextUrl.searchParams.get('search') || '';
    const status = req.nextUrl.searchParams.get('status');
    const myOnly = req.nextUrl.searchParams.get('myOnly') === 'true';
    const salesExecutiveId = req.nextUrl.searchParams.get('salesExecutiveId');

    const where: any = {
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: 'insensitive' as const } },
              { city: { contains: q, mode: 'insensitive' as const } },
              { email: { contains: q, mode: 'insensitive' as const } },
              { salesExecutiveName: { contains: q, mode: 'insensitive' as const } },
              { salesExecutiveCode: { contains: q, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(status ? { status: status as 'ACTIVE' | 'SUSPENDED' | 'ONBOARDING' } : {}),
      ...(salesExecutiveId ? { createdById: salesExecutiveId } : {}),
      ...(myOnly && actor ? { createdById: actor.id } : {}),
    };

    const [data, total, myCount, totalAll] = await Promise.all([
      db.restaurant.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { tables: true, menuItems: true } },
          tables: {
            select: {
              qrCode: {
                select: { scansTotal: true },
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
        },
      }),
      db.restaurant.count({ where }),
      actor ? db.restaurant.count({ where: { deletedAt: null, createdById: actor.id } }) : Promise.resolve(0),
      db.restaurant.count({ where: { deletedAt: null } }),
    ]);

    const mappedData = data.map((r: any) => {
      const totalScans = r.tables?.reduce((acc: number, t: any) => acc + (t.qrCode?.scansTotal || 0), 0) || 0;
      return {
        ...r,
        totalScans,
        todayScans: Math.min(totalScans, Math.round(totalScans * 0.2)),
      };
    });

    return NextResponse.json({
      data: mappedData,
      page,
      pageSize,
      total,
      pages: Math.ceil(total / pageSize),
      stats: {
        myOnboardedCount: myCount,
        totalPlatformCount: totalAll,
      },
    });
  } catch (e) {
    return jsonError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const actor = await requireUser('restaurants.write');
    const input = createRestaurantSchema.parse(await req.json());
    const slug = `${input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${crypto.randomUUID().slice(0, 6)}`;

    const isSales = actor.role === 'SALES_EXECUTIVE';
    const execCode =
      (actor as any).employeeId || (isSales ? `EMP-${Math.floor(1000 + Math.random() * 9000)}` : 'ADMIN-DIR');

    const result = await db.$transaction(async (tx) => {
      // 1. Create Restaurant record with employee attribution
      const restaurant = await tx.restaurant.create({
        data: {
          name: input.name,
          externalId: input.externalId,
          description: input.description,
          cuisine: input.cuisine,
          phone: input.phone,
          email: input.email || null,
          website: input.website,
          address: input.address,
          city: input.city,
          state: input.state,
          country: input.country || 'India',
          pincode: input.pincode,
          openingTime: input.openingTime,
          closingTime: input.closingTime,
          workingDays: input.workingDays,
          logoUrl: input.logoUrl,
          slug,
          status: 'ACTIVE',
          // Sales executive attribution
          createdById: actor.id,
          salesExecutiveName: actor.name,
          salesExecutiveEmail: actor.email,
          salesExecutiveCode: execCode,
          salesExecutivePhone: actor.phone || null,
          salesNotes: input.salesNotes || null,
          leadSource: input.leadSource || 'Field Visit',
          onboardingSource: isSales ? 'SALES_EXECUTIVE' : 'ADMIN_PORTAL',
          superAdminApproval: 'APPROVED',
        },
      });

      // 2. Provision Admin User if credentials are provided
      let adminInfo = null;
      if (input.adminEmail && input.adminPassword) {
        const passwordHash = await hashPassword(input.adminPassword);
        const emailLower = input.adminEmail.toLowerCase();

        let userRecord = await tx.user.findUnique({ where: { email: emailLower } });
        if (!userRecord) {
          userRecord = await tx.user.create({
            data: {
              name: input.adminName || `${input.name} Admin`,
              email: emailLower,
              passwordHash,
              phone: input.phone,
              role: UserRole.RESTAURANT_ADMIN,
              status: 'ACTIVE',
            },
          });
        }

        // Link restaurant user membership
        await tx.restaurantUser.upsert({
          where: {
            userId_restaurantId: {
              userId: userRecord.id,
              restaurantId: restaurant.id,
            },
          },
          create: {
            userId: userRecord.id,
            restaurantId: restaurant.id,
            status: 'ACTIVE',
            permissions: [
              'restaurants.read',
              'menu.read',
              'menu.write',
              'orders.read',
              'orders.write',
              'reviews.read',
              'reports.read',
            ],
          },
          update: {},
        });

        // Ensure default permissions assigned
        const defaultPermissions = [
          'restaurants.read',
          'menu.read',
          'menu.write',
          'orders.read',
          'orders.write',
          'reviews.read',
          'reports.read',
        ];
        for (const key of defaultPermissions) {
          const perm = await tx.permission.upsert({
            where: { key },
            create: { key, description: `Permission to ${key.replace('.', ' ')}` },
            update: {},
          });
          const hasAssignment = await tx.roleAssignment.findFirst({
            where: { userId: userRecord.id, permissionId: perm.id },
          });
          if (!hasAssignment) {
            await tx.roleAssignment.create({
              data: { userId: userRecord.id, permissionId: perm.id },
            });
          }
        }

        adminInfo = {
          id: userRecord.id,
          name: userRecord.name,
          email: userRecord.email,
        };
      }

      // 3. Provision Initial Tables & QRs
      const tableCount = input.initialTableCount ?? 5;
      const createdTables = [];
      for (let i = 1; i <= tableCount; i++) {
        const label = `Table ${String(i).padStart(2, '0')}`;
        const table = await tx.diningTable.create({
          data: {
            restaurantId: restaurant.id,
            label,
            qrCode: {
              create: {
                status: 'ACTIVE',
              },
            },
          },
          include: {
            qrCode: true,
          },
        });
        createdTables.push(table);
      }

      // 4. Audit Log with Sales Executive details
      await tx.auditLog.create({
        data: {
          actorId: actor.id,
          restaurantId: restaurant.id,
          action: 'restaurant.onboarded_by_sales_executive',
          objectType: 'Restaurant',
          objectId: restaurant.id,
          details: {
            salesExecutiveName: actor.name,
            salesExecutiveEmail: actor.email,
            salesExecutiveCode: execCode,
            salesNotes: input.salesNotes || null,
            leadSource: input.leadSource || 'Field Visit',
            restaurantName: restaurant.name,
            city: restaurant.city,
            tablesCount: createdTables.length,
            adminEmail: input.adminEmail || null,
          },
        },
      });

      return {
        ...restaurant,
        _count: { tables: createdTables.length },
        adminUser: adminInfo,
        tables: createdTables,
      };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}
