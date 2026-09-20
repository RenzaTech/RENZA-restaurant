const { PrismaClient } = require('@prisma/client')

const prisma = global.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production' || process.env.VERCEL) {
  global.prisma = prisma
}

module.exports = prisma

