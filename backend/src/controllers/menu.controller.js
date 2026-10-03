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
  try {
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

    // If not found by restaurant slug, check if this is a table QR token or table id
    if (!restaurant) {
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
        restaurant = tableMatch.restaurant
      }
    }

    // If exact slug match not found, check for prefix match or stripped suffix (e.g. -t1, -t01)
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
  } catch (dbErr) {
    console.warn('[Menu] Database offline or unreachable. Loading fallback json:', dbErr.message)
    const candidates = [
      path.join(__dirname, '..', '..', 'data', `${slug}-menu.json`),
      path.join(__dirname, '..', '..', 'data', 'anbude-cafe-menu.json'),
      path.join(__dirname, '..', '..', '..', 'data', `${slug}-menu.json`),
      path.join(__dirname, '..', '..', '..', 'data', 'anbude-cafe-menu.json'),
      path.join(__dirname, '..', '..', '..', 'customer-menu', 'data', 'anbude-cafe-menu.json'),
    ]
    const targetFile = candidates.find((f) => fs.existsSync(f))
    if (targetFile) {
      const fallbackData = JSON.parse(fs.readFileSync(targetFile, 'utf8'))
      return res.json(fallbackData)
    }
    throw dbErr
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
    },
    categories: restaurant.categories,
    foodItems: restaurant.foodItems,
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

  // Find restaurant by slug
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } })
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
