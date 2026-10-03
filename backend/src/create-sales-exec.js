require('dotenv').config()
const bcrypt = require('bcryptjs')
const prisma = require('./lib/prisma')

async function createSalesExecutive() {
  const email = process.argv[2] || 'rahul.sharma@scanzaa.com'
  const password = process.argv[3] || 'Sales2026!'
  const name = process.argv[4] || 'Rahul Sharma'
  const employeeId = process.argv[5] || 'EMP-1042'
  const territory = process.argv[6] || 'Bangalore South'

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase().trim() },
    update: {
      passwordHash,
      name,
      role: 'sales_executive',
      employeeId,
      department: 'Sales',
      territory,
    },
    create: {
      email: email.toLowerCase().trim(),
      passwordHash,
      name,
      role: 'sales_executive',
      employeeId,
      department: 'Sales',
      territory,
    },
  })

  console.log('✓ Sales Executive saved to Neon database!')
  console.log(`   Email: ${user.email}`)
  console.log(`   Name:  ${user.name}`)
  console.log(`   Role:  ${user.role}`)
  console.log(`   ID:    ${user.employeeId}`)
  console.log(`   Territory: ${user.territory}`)
  await prisma.$disconnect()
}

createSalesExecutive().catch(console.error)
