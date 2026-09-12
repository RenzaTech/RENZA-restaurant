require('dotenv').config()

const bcrypt = require('bcryptjs')
const path = require('path')
const fs = require('fs')
const prisma = require('./lib/prisma')

async function cleanDatabase() {
  console.log('🧹 Starting full database reset...\n')

  try {
    // 1. Delete all operational dummy records
    console.log('1. Removing all analytics events...')
    const deletedEvents = await prisma.analyticsEvent.deleteMany({})
    console.log(`   Deleted ${deletedEvents.count} analytics events`)

    console.log('2. Removing all food items...')
    const deletedFoods = await prisma.foodItem.deleteMany({})
    console.log(`   Deleted ${deletedFoods.count} food items`)

    console.log('3. Removing all categories...')
    const deletedCategories = await prisma.category.deleteMany({})
    console.log(`   Deleted ${deletedCategories.count} categories`)

    console.log('4. Removing all restaurant admins...')
    const deletedAdmins = await prisma.user.deleteMany({
      where: { role: 'restaurant_admin' },
    })
    console.log(`   Deleted ${deletedAdmins.count} restaurant admin users`)

    console.log('5. Removing all restaurants...')
    const deletedRestaurants = await prisma.restaurant.deleteMany({})
    console.log(`   Deleted ${deletedRestaurants.count} restaurants`)

    // 6. Clean local uploads folder
    const uploadsDir = path.join(__dirname, '..', 'uploads')
    if (fs.existsSync(uploadsDir)) {
      const files = fs.readdirSync(uploadsDir)
      for (const file of files) {
        try {
          fs.unlinkSync(path.join(uploadsDir, file))
        } catch (err) {
          // ignore
        }
      }
      console.log(`6. Cleaned ${files.length} local upload file(s)`)
    }

    // 7. Initialize fresh Super Admin from environment variables
    const adminEmail = (process.env.SUPER_ADMIN_EMAIL || 'admin@renza.com').trim().toLowerCase()
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD || 'AdminPassword2026!'
    const adminName = process.env.SUPER_ADMIN_NAME || 'Super Admin'

    // Remove any previous superadmin users to ensure clean slate
    await prisma.user.deleteMany({
      where: { role: 'superadmin' },
    })

    const passwordHash = await bcrypt.hash(adminPassword, 12)
    const freshSuperAdmin = await prisma.user.create({
      data: {
        email: adminEmail,
        passwordHash,
        name: adminName,
        role: 'superadmin',
      },
    })

    console.log('\n✨ Database is now fresh, clean, and ready!')
    console.log('══════════════════════════════════════════════════════════')
    console.log('  FRESH SUPER ADMIN CREDENTIALS:')
    console.log(`  Name:     ${freshSuperAdmin.name}`)
    console.log(`  Email:    ${freshSuperAdmin.email}`)
    console.log(`  Password: ${adminPassword}`)
    console.log('══════════════════════════════════════════════════════════')
    console.log('\nYou can log into the Super Admin portal at:')
    console.log('  http://localhost:3001/login')
    console.log('\nRestaurants created by Super Admin will generate their own unique')
    console.log('Restaurant Admin logins and table QR codes with zero dummy data.\n')
  } catch (error) {
    console.error('❌ Failed to clean database:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

cleanDatabase()
