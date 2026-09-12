const crypto = require('crypto')
const prisma = require('../lib/prisma')

const VALID_EVENT_TYPES = ['qr_scan', 'menu_view', 'item_view']

/**
 * GET /api/menu/:slug
 * Public — returns restaurant menu (only if active)
 */
const getMenu = async (req, res) => {
  const { slug } = req.params

  const restaurant = await prisma.restaurant.findUnique({
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

  if (!restaurant) {
    return res.status(404).json({ error: 'Restaurant not found' })
  }

  if (restaurant.status !== 'active') {
    return res.status(403).json({ error: 'This restaurant menu is currently unavailable' })
  }

  // Return all items with isAvailable flag (frontend decides what to show)
  return res.json({
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      description: restaurant.description,
      cuisineType: restaurant.cuisineType,
      logoUrl: restaurant.logoUrl,
      address: restaurant.address,
      phone: restaurant.phone,
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
