const path = require('path')
const fs = require('fs')
const crypto = require('crypto')
const prisma = require('../lib/prisma')

const VALID_EVENT_TYPES = ['qr_scan', 'menu_view', 'item_view']

/**
 * GET /api/menu/:slug
 * Public — returns restaurant menu (only if active)
 */
const getMenu = async (req, res) => {
  const { slug } = req.params

  let restaurant = null
  let matchedTable = null
  try {
    // 1. Check if slug is a table QR token or table id
    const tableMatch = await prisma.diningTable.findFirst({
      where: {
        OR: [{ qrToken: slug }, { id: slug }],
      },
      include: {
        restaurant: {
          include: {
            categories: {
              orderBy: { sortOrder: 'asc' },
            },
            foodItems: {
              include: {
                category: { select: { id: true, name: true } },
              },
              orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
            },
          },
        },
      },
    })
    if (tableMatch?.restaurant) {
      matchedTable = tableMatch
      restaurant = tableMatch.restaurant
    }

    // 2. If not found by table token, check by restaurant slug
    if (!restaurant) {
      restaurant = await prisma.restaurant.findUnique({
        where: { slug },
        include: {
          categories: {
            orderBy: { sortOrder: 'asc' },
          },
          foodItems: {
            include: {
              category: { select: { id: true, name: true } },
            },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          },
        },
      })
    }

    // 3. If exact slug match not found, check for prefix match or stripped suffix (e.g. -t1, -t01)
    if (!restaurant) {
      const strippedSlug = slug.replace(/-t\d+$/i, '').replace(/-[a-z0-9]{4}$/, '')
      restaurant = await prisma.restaurant.findFirst({
        where: {
          OR: [
            { slug: { startsWith: `${slug}-` } },
            { slug: strippedSlug },
          ],
        },
        include: {
          categories: {
            orderBy: { sortOrder: 'asc' },
          },
          foodItems: {
            include: {
              category: { select: { id: true, name: true } },
            },
            orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
          },
        },
      })
    }

    // 4. If restaurant was found but table not yet matched, check if slug or query params reference a table
    if (restaurant && !matchedTable) {
      const tableNumMatch = slug.match(/-t(\d+)$/i)
      const queryTable = req.query?.table || req.query?.t
      const candidates = []

      if (tableNumMatch) {
        const num = parseInt(tableNumMatch[1], 10)
        candidates.push({ qrToken: slug })
        candidates.push({ label: `Table ${num}` })
        candidates.push({ label: `Table ${String(num).padStart(2, '0')}` })
      }
      if (queryTable) {
        const qStr = queryTable.toString().trim()
        const qNum = parseInt(qStr.replace(/\D+/g, ''), 10)
        candidates.push({ label: qStr })
        candidates.push({ label: `Table ${qStr}` })
        if (!isNaN(qNum)) {
          candidates.push({ label: `Table ${qNum}` })
          candidates.push({ label: `Table ${String(qNum).padStart(2, '0')}` })
        }
      }

      if (candidates.length > 0) {
        matchedTable = await prisma.diningTable.findFirst({
          where: {
            restaurantId: restaurant.id,
            OR: candidates,
          },
        })
      }
    }

    // 5. Track table scans count & analytics event when restaurant is active
    if (restaurant && restaurant.status === 'active') {
      if (matchedTable) {
        await prisma.diningTable.update({
          where: { id: matchedTable.id },
          data: { scansCount: { increment: 1 } },
        }).catch(() => {})
      }

      const rawIp =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket?.remoteAddress ||
        'unknown'
      const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex')
      const sessionId = req.headers['x-session-id'] || `scan_${matchedTable?.id || slug}_${Date.now()}`

      await prisma.analyticsEvent.create({
        data: {
          restaurantId: restaurant.id,
          eventType: 'qr_scan',
          sessionId,
          deviceType: 'mobile',
          ipHash,
        },
      }).catch(() => {})
    }
  } catch (dbErr) {
    console.error('[Menu Error]', dbErr)
    const candidates = [
      path.join(__dirname, '..', '..', 'data', `${slug}-menu.json`),
      path.join(__dirname, '..', '..', 'data', 'anbude-cafe-menu.json'),
      path.join(__dirname, '..', '..', '..', 'data', `${slug}-menu.json`),
      path.join(__dirname, '..', '..', '..', 'data', 'anbude-cafe-menu.json'),
      path.join(__dirname, '..', '..', '..', 'customer-menu', 'data', 'anbude-cafe-menu.json'),
    ]
    const targetFile = candidates.find((f) => fs.existsSync(f))
    if (targetFile) {
      try {
        const fallbackData = JSON.parse(fs.readFileSync(targetFile, 'utf8'))
        return res.json(fallbackData)
      } catch (_) {}
    }
    return res.status(500).json({ error: 'Internal server error', message: dbErr?.message })
  }

  if (!restaurant) {
    // If not found in DB, check if local fallback json exists for this slug or default
    const candidates = [
      path.join(__dirname, '..', '..', 'data', `${slug}-menu.json`),
      path.join(__dirname, '..', '..', '..', 'data', `${slug}-menu.json`),
    ]
    const targetFile = candidates.find((f) => fs.existsSync(f))
    if (targetFile) {
      const fallbackData = JSON.parse(fs.readFileSync(targetFile, 'utf8'))
      return res.json(fallbackData)
    }
    return res.status(404).json({ error: 'Restaurant not found' })
  }

  if (restaurant.status === 'suspended') {
    return res.status(403).json({ error: 'This restaurant menu is currently unavailable' })
  }

  // Dining feedback is managed by the restaurant admin for diner experience
  const diningFeedbackUrl = restaurant.feedbackUrl?.trim() || null

  // Renza platform feedback / issue reporting is managed by Super Admin and displayed in the footer
  const renzaFeedbackUrl = restaurant.superAdminFeedbackUrl?.trim() || process.env.RENZA_FEEDBACK_URL || null

  // Derive table representation (if matchedTable was found, or inferred from slug like -t1)
  let tableInfo = null
  if (matchedTable) {
    const cleanLabel = matchedTable.label?.replace(/^Table 0(\d)$/i, 'Table $1') || matchedTable.label
    tableInfo = {
      id: matchedTable.id,
      label: cleanLabel,
      rawLabel: matchedTable.label,
      qrToken: matchedTable.qrToken,
    }
  } else {
    const tableNumMatch = slug.match(/-t(\d+)$/i)
    if (tableNumMatch) {
      tableInfo = {
        label: `Table ${parseInt(tableNumMatch[1], 10)}`,
        qrToken: slug,
      }
    }
  }

  // Process combos for sequential auto-enumeration (Combo 1, Combo 2, ...) and parsed combo items
  let comboCounter = 1
  const processedFoodItems = (restaurant.foodItems || []).map((item) => {
    if (item.isCombo) {
      const assignedLabel = item.comboLabel || `Combo ${comboCounter++}`
      let parsedItems = []
      if (item.comboItems) {
        try {
          parsedItems = typeof item.comboItems === 'string' ? JSON.parse(item.comboItems) : item.comboItems
          if (!Array.isArray(parsedItems)) parsedItems = []
        } catch {
          parsedItems = []
        }
      }
      return {
        ...item,
        isCombo: true,
        comboLabel: assignedLabel,
        comboItemsList: parsedItems,
      }
    }
    return item
  })

  const categoriesWithItems = (restaurant.categories || []).map((cat) => {
    const catItems = processedFoodItems.filter(
      (item) => item.categoryId === cat.id || item.category?.id === cat.id
    )
    return {
      ...cat,
      items: catItems,
      foodItems: catItems,
    }
  })

  // Return all items with isAvailable flag (frontend decides what to show)
  return res.json({
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      status: restaurant.status,
      isSetupMode: restaurant.status === 'setup',
      description: restaurant.description,
      cuisineType: restaurant.cuisineType,
      logoUrl: restaurant.logoUrl,
      address: restaurant.address,
      phone: restaurant.phone,
      googleReviewUrl: restaurant.googleReviewUrl,
      feedbackUrl: diningFeedbackUrl,
      superAdminFeedbackUrl: renzaFeedbackUrl,
      table: tableInfo,
    },
    table: tableInfo,
    categories: categoriesWithItems,
    foodItems: processedFoodItems,
  })
}

/**
 * POST /api/menu/:slug/track
 * Public — record an analytics event
 * Body: { eventType, sessionId, foodItemId?, deviceType? }
 */
const trackEvent = async (req, res) => {
  const { slug } = req.params
  const { eventType, sessionId, foodItemId, deviceType } = req.body

  if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
    return res.status(400).json({ error: `eventType must be one of: ${VALID_EVENT_TYPES.join(', ')}` })
  }

  if (!sessionId) {
    return res.status(400).json({ error: 'sessionId is required' })
  }

  // Find restaurant by slug or table qrToken
  let restaurant = await prisma.restaurant.findUnique({ where: { slug } })
  let matchedTable = null
  if (!restaurant) {
    const tableMatch = await prisma.diningTable.findFirst({
      where: { OR: [{ qrToken: slug }, { id: slug }] },
      include: { restaurant: true },
    })
    if (tableMatch?.restaurant) {
      matchedTable = tableMatch
      restaurant = tableMatch.restaurant
    }
  }

  if (restaurant && !matchedTable) {
    const tableNumMatch = slug.match(/-t(\d+)$/i)
    if (tableNumMatch) {
      const num = parseInt(tableNumMatch[1], 10)
      matchedTable = await prisma.diningTable.findFirst({
        where: {
          restaurantId: restaurant.id,
          OR: [
            { qrToken: slug },
            { label: `Table ${num}` },
            { label: `Table ${String(num).padStart(2, '0')}` },
          ],
        },
      })
    }
  }

  if (matchedTable && restaurant?.status === 'active' && (eventType === 'qr_scan' || eventType === 'menu_view')) {
    await prisma.diningTable.update({
      where: { id: matchedTable.id },
      data: { scansCount: { increment: 1 } },
    }).catch(() => {})
  }
  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' })
  }

  // If restaurant is in Setup Mode or Suspended, DO NOT count views or scans
  // Counting officially starts only once Super Admin sets the restaurant to Live Mode ('active')
  if (restaurant.status !== 'active') {
    return res.json({ ok: true, tracked: false, reason: 'Restaurant is in setup mode' })
  }

  // Hash the client IP for privacy
  const rawIp =
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex')

  // Validate foodItemId if provided for item_view events
  let validatedFoodItemId = null
  if (eventType === 'item_view' && foodItemId) {
    const item = await prisma.foodItem.findUnique({ where: { id: foodItemId } })
    if (item && item.restaurantId === restaurant.id) {
      validatedFoodItemId = foodItemId
    }
  }

  await prisma.analyticsEvent.create({
    data: {
      restaurantId: restaurant.id,
      eventType,
      sessionId: String(sessionId),
      foodItemId: validatedFoodItemId,
      deviceType: deviceType?.trim() || null,
      ipHash,
    },
  })

  return res.json({ ok: true })
}

module.exports = { getMenu, trackEvent }
