const prisma = require('../lib/prisma')

/**
 * Generate a clean, short, URL-safe unique code
 * e.g., RC-7821 or 6-char alphanumeric
 */
const generateUniqueCode = async () => {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // unambiguous chars
  let code = ''
  let exists = true

  while (exists) {
    code = 'RC-'
    for (let i = 0; i < 4; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    const found = await prisma.nfcReviewCard.findUnique({
      where: { uniqueCode: code },
    })
    if (!found) exists = false
  }
  return code
}

/**
 * List active restaurants for generator dropdown
 */
exports.listRestaurants = async (req, res) => {
  const restaurants = await prisma.restaurant.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      city: true,
      logoUrl: true,
      googleReviewUrl: true,
      status: true,
    },
    orderBy: { name: 'asc' },
  })
  res.json({ success: true, data: restaurants })
}

/**
 * List all NFC cards (with restaurant details)
 */
exports.listCards = async (req, res) => {
  const { restaurantId } = req.query
  const where = restaurantId ? { restaurantId } : {}

  const cards = await prisma.nfcReviewCard.findMany({
    where,
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  res.json({ success: true, data: cards })
}

/**
 * Create a new Smart NFC Card
 */
exports.createCard = async (req, res) => {
  const { restaurantId, targetGoogleUrl, label, customCode } = req.body

  if (!restaurantId) {
    return res.status(400).json({ success: false, message: 'Restaurant ID is required' })
  }
  if (!targetGoogleUrl) {
    return res.status(400).json({ success: false, message: 'Target Google Review URL is required' })
  }

  // Verify restaurant exists
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
  })
  if (!restaurant) {
    return res.status(404).json({ success: false, message: 'Restaurant not found' })
  }

  let uniqueCode = customCode ? customCode.trim().toUpperCase() : null
  if (uniqueCode) {
    const existing = await prisma.nfcReviewCard.findUnique({
      where: { uniqueCode },
    })
    if (existing) {
      return res.status(400).json({ success: false, message: `Code ${uniqueCode} is already in use` })
    }
  } else {
    uniqueCode = await generateUniqueCode()
  }

  const card = await prisma.nfcReviewCard.create({
    data: {
      restaurantId,
      uniqueCode,
      targetGoogleUrl: targetGoogleUrl.trim(),
      label: label ? label.trim() : 'Counter Card',
      isActive: true,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
        },
      },
    },
  })

  // Also update restaurant's googleReviewUrl if not set
  if (!restaurant.googleReviewUrl && targetGoogleUrl) {
    await prisma.restaurant.update({
      where: { id: restaurantId },
      data: { googleReviewUrl: targetGoogleUrl.trim() },
    })
  }

  res.status(201).json({ success: true, data: card })
}

/**
 * Public Fast Lookup Endpoint for /c/:code (Customer Tap / QR Scan)
 */
exports.getCardByCode = async (req, res) => {
  const { code } = req.params

  if (!code) {
    return res.status(400).json({ success: false, message: 'Card code is required' })
  }

  const card = await prisma.nfcReviewCard.findUnique({
    where: { uniqueCode: code.toUpperCase() },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          status: true,
        },
      },
    },
  })

  if (!card) {
    return res.status(404).json({ success: false, message: 'NFC Card not found' })
  }

  // Increment taps asynchronously without blocking redirect response
  prisma.nfcReviewCard
    .update({
      where: { id: card.id },
      data: {
        totalTaps: { increment: 1 },
        lastTappedAt: new Date(),
      },
    })
    .catch((err) => console.error('[NFC] Error updating tap count:', err.message))

  // Determine if active: card must be active AND restaurant not suspended
  const isOverallActive = card.isActive && card.restaurant.status !== 'suspended'

  res.json({
    success: true,
    data: {
      uniqueCode: card.uniqueCode,
      targetGoogleUrl: card.targetGoogleUrl,
      isActive: isOverallActive,
      cardActive: card.isActive,
      restaurantStatus: card.restaurant.status,
      restaurant: {
        name: card.restaurant.name,
        slug: card.restaurant.slug,
        logoUrl: card.restaurant.logoUrl,
      },
    },
  })
}

/**
 * Toggle Card ON / OFF (Controlled from Super Admin)
 */
exports.toggleCardStatus = async (req, res) => {
  const { id } = req.params
  const { isActive } = req.body

  const card = await prisma.nfcReviewCard.findUnique({ where: { id } })
  if (!card) {
    return res.status(404).json({ success: false, message: 'Card not found' })
  }

  const updated = await prisma.nfcReviewCard.update({
    where: { id },
    data: {
      isActive: typeof isActive === 'boolean' ? isActive : !card.isActive,
    },
    include: {
      restaurant: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  res.json({ success: true, data: updated })
}

/**
 * Update card details (targetGoogleUrl, label)
 */
exports.updateCard = async (req, res) => {
  const { id } = req.params
  const { targetGoogleUrl, label, isActive } = req.body

  const data = {}
  if (targetGoogleUrl) data.targetGoogleUrl = targetGoogleUrl.trim()
  if (label !== undefined) data.label = label.trim()
  if (typeof isActive === 'boolean') data.isActive = isActive

  const updated = await prisma.nfcReviewCard.update({
    where: { id },
    data,
  })

  res.json({ success: true, data: updated })
}

/**
 * Delete a card
 */
exports.deleteCard = async (req, res) => {
  const { id } = req.params
  await prisma.nfcReviewCard.delete({ where: { id } })
  res.json({ success: true, message: 'Card deleted successfully' })
}
