require('dotenv').config()
const prisma = require('./lib/prisma')

async function clearAnalytics() {
  try {
    const beforeCount = await prisma.analyticsEvent.count()
    console.log(`Current analytics events in database: ${beforeCount}`)

    const result = await prisma.analyticsEvent.deleteMany({})
    console.log(`✅ Successfully deleted ${result.count} analytics event(s).`)

    const afterCount = await prisma.analyticsEvent.count()
    console.log(`Remaining analytics events: ${afterCount}`)
  } catch (error) {
    console.error('❌ Failed to clear analytics events:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

clearAnalytics()
