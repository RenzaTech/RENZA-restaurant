const bcrypt = require('bcryptjs')
const QRCode = require('qrcode')
const prisma = require('../lib/prisma')

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Generate a URL-safe slug from a string
 */
const generateSlug = (name) =>
  name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')

/**
 * Return a unique slug — append random 4-char suffix if already taken
 */
const getUniqueSlug = async (name, excludeId = null) => {
  const base = generateSlug(name)
  let slug = base
  let exists = await prisma.restaurant.findFirst({
    where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
  })
  while (exists) {
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`
    exists = await prisma.restaurant.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    })
  }
  return slug
}

/**
 * Get date boundaries
 */
const todayStart = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

const weekStart = () => {
  const d = new Date()
  d.setDate(d.getDate() - 6)
  d.setHours(0, 0, 0, 0)
  return d
}

const monthStart = () => {
  const d = new Date()
  d.setDate(d.getDate() - 29)
  d.setHours(0, 0, 0, 0)
  return d
}

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * GET /api/admin/restaurants
 * List all restaurants with admin info, food counts, analytics summary
 */
const listRestaurants = async (_req, res) => {
  const restaurants = await prisma.restaurant.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      adminUsers: {
        select: { id: true, name: true, email: true, role: true },
      },
      _count: {
        select: { foodItems: true, categories: true },
      },
    },
  })

  const today = todayStart()

  const results = await Promise.all(
    restaurants.map(async (r) => {
      const [todayQr, todayMenu, allQr, allMenu, uniqueToday] = await Promise.all([
        prisma.analyticsEvent.count({
          where: { restaurantId: r.id, eventType: 'qr_scan', createdAt: { gte: today } },
        }),
        prisma.analyticsEvent.count({
          where: { restaurantId: r.id, eventType: 'menu_view', createdAt: { gte: today } },
        }),
        prisma.analyticsEvent.count({
          where: { restaurantId: r.id, eventType: 'qr_scan' },
        }),
        prisma.analyticsEvent.count({
          where: { restaurantId: r.id, eventType: 'menu_view' },
        }),
        prisma.analyticsEvent.findMany({
          where: { restaurantId: r.id, createdAt: { gte: today } },
          select: { sessionId: true },
          distinct: ['sessionId'],
        }),
      ])

      return {
        id: r.id,
        name: r.name,
        slug: r.slug,
        description: r.description,
        cuisineType: r.cuisineType,
        logoUrl: r.logoUrl,
        address: r.address,
        phone: r.phone,
        status: r.status,
        createdAt: r.createdAt,
        adminUsers: r.adminUsers,
        adminEmail: r.adminUsers?.[0]?.email || null,
        adminName: r.adminUsers?.[0]?.name || null,
        foodItemCount: r._count.foodItems,
        foodItemsCount: r._count.foodItems,
        categoryCount: r._count.categories,
        totalScans: allQr,
        totalMenuViews: allMenu,
        todayScans: todayQr,
        todayMenuViews: todayMenu,
        analytics: {
          today: {
            qrScans: todayQr,
            menuViews: todayMenu,
            uniqueVisitors: uniqueToday.length,
          },
          allTime: {
            qrScans: allQr,
            menuViews: allMenu,
          },
        },
      }
    })
  )

  return res.json(results)
}

/**
 * POST /api/admin/restaurants
 * Create a new restaurant with its admin user
 */
const createRestaurant = async (req, res) => {
  const { name, description, cuisineType, address, phone } = req.body
  const adminName = (req.body.adminName || req.body.admin?.name || '').trim()
  const adminEmail = (req.body.adminEmail || req.body.admin?.email || '').trim()
  const adminPassword = req.body.adminPassword || req.body.admin?.password || ''

  // Validation
  if (!name || !name.trim() || !adminName || !adminEmail || !adminPassword) {
    return res.status(400).json({
      error: 'Required fields: Restaurant Name, Admin Name, Admin Email, and Admin Password',
      message: 'Required fields: Restaurant Name, Admin Name, Admin Email, and Admin Password',
    })
  }

  if (adminPassword.length < 6) {
    return res.status(400).json({
      error: 'Admin password must be at least 6 characters',
      message: 'Admin password must be at least 6 characters',
    })
  }

  // Check if admin email is already used
  const existingUser = await prisma.user.findUnique({
    where: { email: adminEmail.toLowerCase().trim() },
  })
  if (existingUser) {
    return res.status(409).json({
      error: 'A user with that email already exists',
      message: 'A user with that email already exists',
    })
  }

  const slug = await getUniqueSlug(name)
  const passwordHash = await bcrypt.hash(adminPassword, 12)

  // Create restaurant and admin in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        cuisineType: cuisineType?.trim() || null,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
      },
    })

    const adminUser = await tx.user.create({
      data: {
        email: adminEmail.toLowerCase().trim(),
        passwordHash,
        name: adminName.trim(),
        role: 'restaurant_admin',
        restaurantId: restaurant.id,
      },
    })

    return { restaurant, adminUser }
  })

  return res.status(201).json({
    success: true,
    id: result.restaurant.id,
    restaurant: result.restaurant,
    adminUser: {
      id: result.adminUser.id,
      email: result.adminUser.email,
      name: result.adminUser.name,
      role: result.adminUser.role,
    },
  })
}

/**
 * GET /api/admin/restaurants/:id
 */
const getRestaurant = async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.params.id },
    include: {
      adminUsers: {
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      },
      categories: {
        include: {
          foodItems: {
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
          },
        },
        orderBy: { sortOrder: 'asc' },
      },
      foodItems: {
        include: { category: { select: { id: true, name: true } } },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      },
      _count: {
        select: { foodItems: true, categories: true, analytics: true },
      },
    },
  })

  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' })
  }

  return res.json({
    ...restaurant,
    adminEmail: restaurant.adminUsers?.[0]?.email || null,
    adminName: restaurant.adminUsers?.[0]?.name || null,
    foodItemCount: restaurant._count.foodItems,
    foodItemsCount: restaurant._count.foodItems,
  })
}

/**
 * PUT /api/admin/restaurants/:id
 */
const updateRestaurant = async (req, res) => {
  const { name, description, cuisineType, address, phone, logoUrl } = req.body

  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } })
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' })
  }

  const updateData = {}
  if (name !== undefined) {
    updateData.name = name.trim()
    updateData.slug = await getUniqueSlug(name, req.params.id)
  }
  if (description !== undefined) updateData.description = description?.trim() || null
  if (cuisineType !== undefined) updateData.cuisineType = cuisineType?.trim() || null
  if (address !== undefined) updateData.address = address?.trim() || null
  if (phone !== undefined) updateData.phone = phone?.trim() || null
  if (logoUrl !== undefined) updateData.logoUrl = logoUrl || null

  const updated = await prisma.restaurant.update({
    where: { id: req.params.id },
    data: updateData,
  })

  return res.json(updated)
}

/**
 * PATCH /api/admin/restaurants/:id/status
 * Toggle active ↔ suspended
 */
const toggleStatus = async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } })
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' })
  }

  const targetStatus = req.body?.status || (restaurant.status === 'active' ? 'suspended' : 'active')
  const updated = await prisma.restaurant.update({
    where: { id: req.params.id },
    data: { status: targetStatus },
  })

  return res.json({ status: updated.status, restaurant: updated })
}

/**
 * GET /api/admin/restaurants/:id/analytics
 */
const getAnalytics = async (req, res) => {
  const { id } = req.params

  const restaurant = await prisma.restaurant.findUnique({ where: { id } })
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' })
  }

  const today = todayStart()
  const week = weekStart()
  const month = monthStart()

  // Parallel aggregate queries
  const [
    todayQr,
    todayMenu,
    todayItem,
    todayUnique,
    weekQr,
    weekMenu,
    weekUnique,
    monthQr,
    monthMenu,
    monthUnique,
    allQr,
    allMenu,
    allUnique,
    topItems,
  ] = await Promise.all([
    prisma.analyticsEvent.count({ where: { restaurantId: id, eventType: 'qr_scan', createdAt: { gte: today } } }),
    prisma.analyticsEvent.count({ where: { restaurantId: id, eventType: 'menu_view', createdAt: { gte: today } } }),
    prisma.analyticsEvent.count({ where: { restaurantId: id, eventType: 'item_view', createdAt: { gte: today } } }),
    prisma.analyticsEvent.findMany({ where: { restaurantId: id, createdAt: { gte: today } }, select: { sessionId: true }, distinct: ['sessionId'] }),
    prisma.analyticsEvent.count({ where: { restaurantId: id, eventType: 'qr_scan', createdAt: { gte: week } } }),
    prisma.analyticsEvent.count({ where: { restaurantId: id, eventType: 'menu_view', createdAt: { gte: week } } }),
    prisma.analyticsEvent.findMany({ where: { restaurantId: id, createdAt: { gte: week } }, select: { sessionId: true }, distinct: ['sessionId'] }),
    prisma.analyticsEvent.count({ where: { restaurantId: id, eventType: 'qr_scan', createdAt: { gte: month } } }),
    prisma.analyticsEvent.count({ where: { restaurantId: id, eventType: 'menu_view', createdAt: { gte: month } } }),
    prisma.analyticsEvent.findMany({ where: { restaurantId: id, createdAt: { gte: month } }, select: { sessionId: true }, distinct: ['sessionId'] }),
    prisma.analyticsEvent.count({ where: { restaurantId: id, eventType: 'qr_scan' } }),
    prisma.analyticsEvent.count({ where: { restaurantId: id, eventType: 'menu_view' } }),
    prisma.analyticsEvent.findMany({ where: { restaurantId: id }, select: { sessionId: true }, distinct: ['sessionId'] }),
    // Top 5 food items by item_view count
    prisma.analyticsEvent.groupBy({
      by: ['foodItemId'],
      where: { restaurantId: id, eventType: 'item_view', foodItemId: { not: null } },
      _count: { foodItemId: true },
      orderBy: { _count: { foodItemId: 'desc' } },
      take: 5,
    }),
  ])

  // Resolve top item names
  const topItemsWithNames = await Promise.all(
    topItems.map(async (t) => {
      const item = await prisma.foodItem.findUnique({
        where: { id: t.foodItemId },
        select: { id: true, name: true },
      })
      return { id: t.foodItemId, name: item?.name || 'Unknown', viewCount: t._count.foodItemId }
    })
  )

  // Hourly breakdown for today (qr_scan)
  const todayEvents = await prisma.analyticsEvent.findMany({
    where: { restaurantId: id, eventType: 'qr_scan', createdAt: { gte: today } },
    select: { createdAt: true },
  })

  const hourlyToday = Array.from({ length: 24 }, (_, h) => ({ hour: h, scans: 0, count: 0 }))
  todayEvents.forEach((e) => {
    const hour = new Date(e.createdAt).getHours()
    hourlyToday[hour].scans++
    hourlyToday[hour].count++
  })

  // Scan history: last 30 days daily qr_scan counts
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 29)
  thirtyDaysAgo.setHours(0, 0, 0, 0)

  const scanEvents = await prisma.analyticsEvent.findMany({
    where: { restaurantId: id, eventType: 'qr_scan', createdAt: { gte: thirtyDaysAgo } },
    select: { createdAt: true },
  })

  // Build a map of date → count
  const scanMap = {}
  scanEvents.forEach((e) => {
    const dateKey = new Date(e.createdAt).toISOString().slice(0, 10)
    scanMap[dateKey] = (scanMap[dateKey] || 0) + 1
  })

  const scanHistory = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateKey = d.toISOString().slice(0, 10)
    scanHistory.push({ date: dateKey, scans: scanMap[dateKey] || 0 })
  }

  const weekMetrics = {
    qrScans: weekQr,
    scans: weekQr,
    menuViews: weekMenu,
    uniqueVisitors: weekUnique.length,
  }

  const monthMetrics = {
    qrScans: monthQr,
    scans: monthQr,
    menuViews: monthMenu,
    uniqueVisitors: monthUnique.length,
  }

  return res.json({
    today: {
      qrScans: todayQr,
      scans: todayQr,
      menuViews: todayMenu,
      itemViews: todayItem,
      uniqueVisitors: todayUnique.length,
    },
    thisWeek: weekMetrics,
    week: weekMetrics,
    thisMonth: monthMetrics,
    month: monthMetrics,
    allTime: {
      qrScans: allQr,
      scans: allQr,
      menuViews: allMenu,
      uniqueVisitors: allUnique.length,
    },
    topItems: topItemsWithNames,
    hourlyToday,
    hourly: hourlyToday,
    hourlyScans: hourlyToday,
    scanHistory,
  })
}

/**
 * GET /api/admin/restaurants/:id/qr
 * Generate QR code as base64 PNG data URL
 */
const getQRCode = async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } })
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' })
  }

  const baseCustomerUrl = process.env.CUSTOMER_URL || 'http://localhost:3003'
  const defaultUrl = `${baseCustomerUrl}/menu/${restaurant.slug}`
  const menuUrl = req.query.url || restaurant.customMenuUrl || defaultUrl

  // Encode ?source=qr into the scanned QR code image
  const separator = menuUrl.includes('?') ? '&' : '?'
  const qrTargetUrl = menuUrl.includes('source=') || menuUrl.includes('src=') ? menuUrl : `${menuUrl}${separator}source=qr`

  const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 500,
    color: { dark: '#000000', light: '#FFFFFF' },
  })

  return res.json({
    qrDataUrl,
    qrCodeUrl: qrDataUrl,
    menuUrl,
    slug: restaurant.slug,
    customMenuUrl: restaurant.customMenuUrl || null,
    defaultUrl,
  })
}

/**
 * PATCH /api/admin/restaurants/:id/qr-url
 * Save custom menu URL and regenerate QR code
 */
const updateQRUrl = async (req, res) => {
  const { customMenuUrl } = req.body
  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } })
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' })
  }

  const updated = await prisma.restaurant.update({
    where: { id: req.params.id },
    data: { customMenuUrl: customMenuUrl ? customMenuUrl.trim() : null },
  })

  const baseCustomerUrl = process.env.CUSTOMER_URL || 'http://localhost:3003'
  const defaultUrl = `${baseCustomerUrl}/menu/${updated.slug}`
  const menuUrl = updated.customMenuUrl || defaultUrl

  // Encode ?source=qr into the scanned QR code image
  const separator = menuUrl.includes('?') ? '&' : '?'
  const qrTargetUrl = menuUrl.includes('source=') || menuUrl.includes('src=') ? menuUrl : `${menuUrl}${separator}source=qr`

  const qrDataUrl = await QRCode.toDataURL(qrTargetUrl, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 500,
    color: { dark: '#000000', light: '#FFFFFF' },
  })

  return res.json({
    qrDataUrl,
    qrCodeUrl: qrDataUrl,
    menuUrl,
    slug: updated.slug,
    customMenuUrl: updated.customMenuUrl,
    defaultUrl,
  })
}

/**
 * DELETE /api/admin/restaurants/:id
 */
const deleteRestaurant = async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } })
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' })
  }

  await prisma.restaurant.delete({ where: { id: req.params.id } })
  return res.json({ message: `Restaurant "${restaurant.name}" deleted successfully` })
}

module.exports = {
  listRestaurants,
  createRestaurant,
  getRestaurant,
  updateRestaurant,
  toggleStatus,
  getAnalytics,
  getQRCode,
  updateQRUrl,
  deleteRestaurant,
}
