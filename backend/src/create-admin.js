require('dotenv').config()
const bcrypt = require('bcryptjs')
const prisma = require('./lib/prisma')

async function createAdmin() {
  const email = process.argv[2]
  const password = process.argv[3]
  const name = process.argv[4] || 'Super Admin'

  if (!email || !password) {
    console.log('Usage: node src/create-admin.js <email> <password> [name]')
    console.log('Example: node src/create-admin.js owner@renza.com SecretPass123 "Main Admin"')
    process.exit(1)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: {
      passwordHash,
      name,
      role: 'superadmin',
    },
    create: {
      email: email.toLowerCase().trim(),
      passwordHash,
      name,
      role: 'superadmin',
    },
  })

  console.log('? Super Admin saved to Neon database!')
  console.log(`   Email: ${user.email}`)
  console.log(`   Name:  ${user.name}`)
  console.log(`   Role:  ${user.role}`)
  await prisma.$disconnect()
}

createAdmin().catch(console.error)
