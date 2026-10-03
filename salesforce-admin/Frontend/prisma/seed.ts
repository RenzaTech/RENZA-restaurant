import 'dotenv/config';
import { PrismaClient, UserRole } from '@prisma/client';
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb);
const db = new PrismaClient();

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString('hex')}`;
}

async function main() {
  console.log('--- Starting Seed: Sales Executive & Super Admin Data ---');

  // 1. Ensure all system permissions exist
  const permissions = [
    'restaurants.read',
    'restaurants.write',
    'menu.read',
    'menu.write',
    'orders.read',
    'orders.write',
    'reviews.read',
    'users.write',
    'reports.read',
  ].map((key) => ({ key, description: `Permission to ${key.replace('.', ' ')}` }));

  for (const permission of permissions) {
    await db.permission.upsert({
      where: { key: permission.key },
      create: permission,
      update: { description: permission.description },
    });
  }

  // 2. Super Admin User
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@scanzaa.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'Scanzaa-Dev-2026!';
  const superAdmin = await db.user.upsert({
    where: { email: adminEmail },
    create: {
      name: 'Scanzaa Admin',
      email: adminEmail,
      passwordHash: await hashPassword(adminPassword),
      role: UserRole.SUPER_ADMIN,
      status: 'ACTIVE',
      employeeId: 'ADM-0001',
      department: 'Executive Governance',
      territory: 'National',
    },
    update: {
      passwordHash: await hashPassword(adminPassword),
      status: 'ACTIVE',
      employeeId: 'ADM-0001',
      department: 'Executive Governance',
      territory: 'National',
    },
  });

  // Assign all permissions to super admin
  const allPerms = await db.permission.findMany();
  for (const p of allPerms) {
    const existing = await db.roleAssignment.findFirst({
      where: { userId: superAdmin.id, permissionId: p.id },
    });
    if (!existing) {
      await db.roleAssignment.create({ data: { userId: superAdmin.id, permissionId: p.id } });
    }
  }

  // 3. Sales Executives (Field Employees)
  const salesPassword = 'Sales2026!';
  const salesPasswordHash = await hashPassword(salesPassword);

  const salesExecutivesData = [
    {
      name: 'Rahul Sharma',
      email: 'rahul.sharma@scanzaa.com',
      employeeId: 'EMP-1042',
      department: 'Field Sales',
      territory: 'Bangalore Central',
      phone: '+91 98450 11223',
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@scanzaa.com',
      employeeId: 'EMP-1088',
      department: 'Enterprise Sales',
      territory: 'Mumbai Metro',
      phone: '+91 98200 44556',
    },
    {
      name: 'Vikram Singh',
      email: 'vikram.singh@scanzaa.com',
      employeeId: 'EMP-1105',
      department: 'Regional Sales',
      territory: 'Delhi NCR',
      phone: '+91 98110 77889',
    },
  ];

  const seededExecutives: any[] = [];
  for (const execData of salesExecutivesData) {
    const exec = await db.user.upsert({
      where: { email: execData.email },
      create: {
        name: execData.name,
        email: execData.email,
        passwordHash: salesPasswordHash,
        role: UserRole.SALES_EXECUTIVE,
        status: 'ACTIVE',
        employeeId: execData.employeeId,
        department: execData.department,
        territory: execData.territory,
        phone: execData.phone,
      },
      update: {
        name: execData.name,
        passwordHash: salesPasswordHash,
        status: 'ACTIVE',
        employeeId: execData.employeeId,
        department: execData.department,
        territory: execData.territory,
        phone: execData.phone,
      },
    });
    seededExecutives.push(exec);

    // Assign sales permissions (read/write restaurants, read menu)
    const salesPermKeys = ['restaurants.read', 'restaurants.write', 'menu.read'];
    for (const key of salesPermKeys) {
      const p = await db.permission.findUnique({ where: { key } });
      if (p) {
        const has = await db.roleAssignment.findFirst({
          where: { userId: exec.id, permissionId: p.id },
        });
        if (!has) {
          await db.roleAssignment.create({ data: { userId: exec.id, permissionId: p.id } });
        }
      }
    }
  }

  console.log('✅ Seed completed successfully:');
  console.log(`- Super Admin: ${adminEmail} (PW: ${adminPassword})`);
  console.log('- Sales Executives:');
  salesExecutivesData.forEach((s) => console.log(`  * ${s.name} (${s.employeeId}): ${s.email} (PW: ${salesPassword})`));
  console.log('- Ready for fresh restaurant onboarding via Sales Executive Portal!');

  await db.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await db.$disconnect();
  process.exit(1);
});
