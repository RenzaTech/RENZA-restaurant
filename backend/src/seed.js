require('dotenv').config()

const bcrypt = require('bcryptjs')
const prisma = require('./lib/prisma')

async function main() {
  console.log('?? Initializing Super Admin...\n')

  const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@renza.com').trim().toLowerCase()
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD || 'AdminPassword2026!'
  const superAdminName = process.env.SUPER_ADMIN_NAME || 'Super Admin'

  const passwordHash = await bcrypt.hash(superAdminPassword, 12)

  const existing = await prisma.user.findUnique({ where: { email: superAdminEmail } })

  let superAdmin
  if (existing) {
    superAdmin = await prisma.user.update({
      where: { email: superAdminEmail },
      data: {
        name: superAdminName,
        passwordHash,
        role: 'superadmin',
      },
    })
    console.log(`? Super Admin updated: ${superAdminEmail}`)
  } else {
    superAdmin = await prisma.user.create({
      data: {
        email: superAdminEmail,
        passwordHash,
        name: superAdminName,
        role: 'superadmin',
      },
    })
    console.log(`? Super Admin created: ${superAdminEmail}`)
  }

  console.log('\n----------------------------------------------------------')
  console.log('  SUPER ADMIN CREDENTIALS:')
  console.log(`  Name:     ${superAdmin.name}`)
  console.log(`  Email:    ${superAdmin.email}`)
  console.log(`  Password: ${superAdminPassword}`)
  console.log('----------------------------------------------------------')
  console.log('\nLogin at http://localhost:3001/login')
  console.log('Platform is ready with zero dummy records.\n')
}

main()
  .catch((e) => {
    console.error('? Error during seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
