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
        city: r.city || '',
        status: r.status,
        feedbackUrl: r.feedbackUrl,
        superAdminFeedbackUrl: r.superAdminFeedbackUrl,
        overrideFeedbackUrl: r.overrideFeedbackUrl,
        createdAt: r.createdAt,
        salesExecutiveName: r.salesExecutiveName || '—',
        salesExecutiveCode: r.salesExecutiveCode || '—',
        salesExecutiveEmail: r.salesExecutiveEmail || '—',
        salesExecutivePhone: r.salesExecutivePhone || '',
        salesNotes: r.salesNotes || '',
        leadSource: r.leadSource || 'Field Visit',
        onboardingSource: r.onboardingSource || 'SALES_EXECUTIVE',
        tableCount: r.initialTableCount || 5,
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
  const { name, description, cuisineType, address, city, phone, feedbackUrl, superAdminFeedbackUrl, overrideFeedbackUrl, initialTableCount, salesNotes, leadSource } = req.body
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

  let cleanFeedbackUrl = feedbackUrl?.trim() || null
  if (cleanFeedbackUrl && !/^https?:\/\//i.test(cleanFeedbackUrl)) cleanFeedbackUrl = `https://${cleanFeedbackUrl}`

  let cleanSuperAdminFeedbackUrl = superAdminFeedbackUrl?.trim() || null
  if (cleanSuperAdminFeedbackUrl && !/^https?:\/\//i.test(cleanSuperAdminFeedbackUrl)) cleanSuperAdminFeedbackUrl = `https://${cleanSuperAdminFeedbackUrl}`

  const tableNum = Number(initialTableCount) || 5

  // Create restaurant, dining tables, and admin in a transaction
  const result = await prisma.$transaction(async (tx) => {
    const restaurant = await tx.restaurant.create({
      data: {
        name: name.trim(),
        slug,
        description: description?.trim() || null,
        cuisineType: cuisineType?.trim() || null,
        address: address?.trim() || null,
        city: city?.trim() || null,
        phone: phone?.trim() || null,
        feedbackUrl: cleanFeedbackUrl,
        superAdminFeedbackUrl: cleanSuperAdminFeedbackUrl,
        overrideFeedbackUrl: overrideFeedbackUrl === true || overrideFeedbackUrl === 'true',
        createdById: req.user ? req.user.id : null,
        salesExecutiveName: req.user?.name || req.body.salesExecutiveName || null,
        salesExecutiveEmail: req.user?.email || req.body.salesExecutiveEmail || null,
        salesExecutiveCode: req.user?.employeeId || req.body.salesExecutiveCode || null,
        salesExecutivePhone: req.user?.phone || req.body.salesExecutivePhone || null,
        salesNotes: salesNotes || req.body.salesNotes || null,
        leadSource: leadSource || req.body.leadSource || 'Field Visit',
        onboardingSource: 'SALES_EXECUTIVE',
        initialTableCount: tableNum,
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

    // Provision initial dining tables with QR tokens
    for (let i = 1; i <= tableNum; i++) {
      const label = `Table ${String(i).padStart(2, '0')}`
      await tx.diningTable.create({
        data: {
          restaurantId: restaurant.id,
          label,
          qrToken: `${slug}-t${i}`,
        },
      })
    }

    return { restaurant, adminUser }
  })

  return res.status(201).json({
    success: true,
    id: result.restaurant.id,
    restaurant: result.restaurant,
    salesExecutiveName: result.restaurant.salesExecutiveName,
    salesExecutiveCode: result.restaurant.salesExecutiveCode,
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
  const { name, description, cuisineType, address, phone, logoUrl, feedbackUrl, superAdminFeedbackUrl, overrideFeedbackUrl, googleReviewUrl } = req.body

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
  if (googleReviewUrl !== undefined) updateData.googleReviewUrl = googleReviewUrl?.trim() || null

  if (feedbackUrl !== undefined) {
    let fb = feedbackUrl?.trim() || null
    if (fb && !/^https?:\/\//i.test(fb)) fb = `https://${fb}`
    updateData.feedbackUrl = fb
  }
  if (superAdminFeedbackUrl !== undefined) {
    let sFb = superAdminFeedbackUrl?.trim() || null
    if (sFb && !/^https?:\/\//i.test(sFb)) sFb = `https://${sFb}`
    updateData.superAdminFeedbackUrl = sFb
  }
  if (overrideFeedbackUrl !== undefined) {
    updateData.overrideFeedbackUrl = overrideFeedbackUrl === true || overrideFeedbackUrl === 'true'
  }

  const updated = await prisma.restaurant.update({
    where: { id: req.params.id },
    data: updateData,
  })

  return res.json(updated)
}

/**
 * PATCH /api/admin/restaurants/:id/status
 * Update status: setup ↔ active (Live) ↔ suspended
 */
const toggleStatus = async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({ where: { id: req.params.id } })
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' })
  }

  let targetStatus = req.body?.status
  if (!targetStatus) {
    if (restaurant.status === 'setup') {
      targetStatus = 'active'
    } else if (restaurant.status === 'active') {
      targetStatus = 'suspended'
    } else {
      targetStatus = 'active'
    }
  }

  if (!['setup', 'active', 'suspended'].includes(targetStatus)) {
    return res.status(400).json({ error: 'Invalid status. Must be setup, active, or suspended.' })
  }

  // If moving from setup to active (Go Live), wipe any accidental test events
  // so real customer view counts strictly begin from zero!
  if (restaurant.status === 'setup' && targetStatus === 'active') {
    await prisma.analyticsEvent.deleteMany({
      where: { restaurantId: req.params.id },
    }).catch(() => {})
  }

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

  await prisma.$transaction(async (tx) => {
    // Delete any users associated with this restaurant first
    await tx.user.deleteMany({ where: { restaurantId: req.params.id } })
    // Delete restaurant (categories, foodItems, and analytics cascade automatically)
    await tx.restaurant.delete({ where: { id: req.params.id } })
  })

  return res.json({ message: `Restaurant "${restaurant.name}" deleted successfully` })
}

/**
 * GET /api/admin/restaurants/:id/tables
 */
const listRestaurantTables = async (req, res) => {
  const tables = await prisma.diningTable.findMany({
    where: { restaurantId: req.params.id },
    orderBy: { label: 'asc' },
  })
  const baseCustomerUrl = process.env.CUSTOMER_URL || 'http://localhost:3003'
  const result = tables.map((t) => ({
    id: t.id,
    label: t.label,
    qrCode: {
      token: t.qrToken || t.id,
      status: 'ACTIVE',
      url: `${baseCustomerUrl}/menu/${t.qrToken || t.id}`,
    },
  }))
  return res.json(result)
}

/**
 * GET or POST /api/admin/restaurants/:id/tables/:tableId/qr
 */
const getTableQR = async (req, res) => {
  const table = await prisma.diningTable.findUnique({
    where: { id: req.params.tableId },
    include: { restaurant: true },
  })
  if (!table) {
    return res.status(404).json({ error: 'Table not found' })
  }
  const baseCustomerUrl = process.env.CUSTOMER_URL || 'http://localhost:3003'
  const url = `${baseCustomerUrl}/menu/${table.qrToken || table.id}`
  const qrDataUrl = await QRCode.toDataURL(url, {
    errorCorrectionLevel: 'H',
    margin: 2,
    width: 500,
    color: { dark: '#000000', light: '#FFFFFF' },
  })
  return res.json({
    qrCode: {
      token: table.qrToken || table.id,
      status: 'ACTIVE',
      dataUrl: qrDataUrl,
      url,
    },
    url,
    table: { id: table.id, label: table.label, qrToken: table.qrToken },
    restaurant: { id: table.restaurant.id, name: table.restaurant.name, slug: table.restaurant.slug },
  })
}

// ─── Employee / Sales Executive Management ────────────────────────────────────

/**
 * GET /api/admin/employees
 * List all sales executives with onboarded restaurant counts
 */
const listEmployees = async (_req, res) => {
  const employees = await prisma.user.findMany({
    where: { role: 'sales_executive' },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      name: true,
      email: true,
      employeeId: true,
      department: true,
      territory: true,
      phone: true,
      createdAt: true,
      _count: {
        select: {
          createdRestaurants: true,
        },
      },
      createdRestaurants: {
        select: {
          id: true,
          name: true,
          city: true,
          status: true,
          createdAt: true,
        },
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  const results = employees.map((e) => ({
    id: e.id,
    name: e.name,
    email: e.email,
    employeeId: e.employeeId || '—',
    department: e.department || 'Sales',
    territory: e.territory || 'Unassigned',
    phone: e.phone || '',
    onboardedCount: e._count?.createdRestaurants || 0,
    recentRestaurants: e.createdRestaurants || [],
    createdAt: e.createdAt,
  }))

  return res.json(results)
}

/**
 * POST /api/admin/employees
 * Super Admin creates a new Sales Executive account
 */
const createEmployee = async (req, res) => {
  const { name, email, password, employeeId, territory, department, phone } = req.body

  if (!name || !name.trim() || !email || !email.trim() || !password || !password.trim()) {
    return res.status(400).json({ error: 'Name, email, and password are required' })
  }

  if (password.trim().length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' })
  }

  const emailLower = email.toLowerCase().trim()
  const existingUser = await prisma.user.findUnique({
    where: { email: emailLower },
  })
  if (existingUser) {
    return res.status(409).json({ error: 'A user with this email address already exists' })
  }

  // Generate unique employee ID if not provided
  let finalEmployeeId = employeeId?.trim()
  if (!finalEmployeeId) {
    const count = await prisma.user.count({ where: { role: 'sales_executive' } })
    finalEmployeeId = `EMP-${1000 + count + 1}`
  } else {
    const existingId = await prisma.user.findUnique({
      where: { employeeId: finalEmployeeId },
    })
    if (existingId) {
      return res.status(409).json({ error: `Employee ID "${finalEmployeeId}" is already taken` })
    }
  }

  const passwordHash = await bcrypt.hash(password.trim(), 12)

  const newEmployee = await prisma.user.create({
    data: {
      name: name.trim(),
      email: emailLower,
      passwordHash,
      role: 'sales_executive',
      employeeId: finalEmployeeId,
      department: department?.trim() || 'Sales',
      territory: territory?.trim() || 'Unassigned',
      phone: phone?.trim() || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      employeeId: true,
      department: true,
      territory: true,
      phone: true,
      createdAt: true,
    },
  })

  return res.status(201).json({
    success: true,
    employee: newEmployee,
    message: `Sales Executive ${newEmployee.name} (${newEmployee.employeeId}) created successfully`,
  })
}

/**
 * PUT /api/admin/employees/:id
 * Super Admin updates employee credentials, territory, or resets password
 */
const updateEmployee = async (req, res) => {
  const { id } = req.params
  const { name, email, password, employeeId, territory, department, phone } = req.body

  const employee = await prisma.user.findUnique({ where: { id } })
  if (!employee || employee.role !== 'sales_executive') {
    return res.status(404).json({ error: 'Sales Executive not found' })
  }

  const updateData = {}
  if (name && name.trim()) updateData.name = name.trim()
  if (territory !== undefined) updateData.territory = territory?.trim() || 'Unassigned'
  if (department !== undefined) updateData.department = department?.trim() || 'Sales'
  if (phone !== undefined) updateData.phone = phone?.trim() || null

  if (email && email.toLowerCase().trim() !== employee.email) {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (existing && existing.id !== id) {
      return res.status(409).json({ error: 'Email is already used by another account' })
    }
    updateData.email = email.toLowerCase().trim()
  }

  if (employeeId && employeeId.trim() !== employee.employeeId) {
    const existing = await prisma.user.findUnique({ where: { employeeId: employeeId.trim() } })
    if (existing && existing.id !== id) {
      return res.status(409).json({ error: 'Employee ID is already in use' })
    }
    updateData.employeeId = employeeId.trim()
  }

  if (password && password.trim()) {
    if (password.trim().length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }
    updateData.passwordHash = await bcrypt.hash(password.trim(), 12)
  }

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      employeeId: true,
      department: true,
      territory: true,
      phone: true,
      createdAt: true,
    },
  })

  return res.json({
    success: true,
    employee: updated,
    message: 'Employee credentials updated successfully',
  })
}

/**
 * DELETE /api/admin/employees/:id
 * Super Admin deletes/revokes a sales executive account
 */
const deleteEmployee = async (req, res) => {
  const { id } = req.params
  const employee = await prisma.user.findUnique({ where: { id } })
  if (!employee || employee.role !== 'sales_executive') {
    return res.status(404).json({ error: 'Sales Executive not found' })
  }

  await prisma.user.delete({ where: { id } })
  return res.json({
    success: true,
    message: `Sales Executive "${employee.name}" deleted successfully`,
  })
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
  listRestaurantTables,
  getTableQR,
  listEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
}
