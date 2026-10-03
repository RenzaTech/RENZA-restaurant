import { NextResponse } from 'next/server';
import { currentUser } from '@/lib/auth';

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }

  let permissions = user.roleAssignments.map((x) => x.permission.key);
  if (user.role === 'SALES_EXECUTIVE') {
    permissions = permissions.filter((p) => !p.startsWith('menu.'));
    if (!permissions.includes('restaurants.read')) permissions.push('restaurants.read');
    if (!permissions.includes('restaurants.write')) permissions.push('restaurants.write');
  }

  const isSuper = user.role === 'SUPER_ADMIN' || user.role === 'COMPANY_ADMIN';
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: isSuper ? 'superadmin' : user.role,
    rawRole: user.role,
    employeeId: (user as any).employeeId || null,
    department: (user as any).department || 'Sales',
    territory: (user as any).territory || null,
    permissions,
  });
}
