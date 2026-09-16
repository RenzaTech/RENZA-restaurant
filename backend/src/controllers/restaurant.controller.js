const prisma = require('../lib/prisma')
const QRCode = require('qrcode')
const { uploadImage, deleteImage } = require('../lib/storage')

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayStart = () => {
  // Support IST (UTC+5:30) date boundary
  const now = new Date()
  const istOffsetMs = 5.5 * 60 * 60 * 1000
  const istDate = new Date(now.getTime() + istOffsetMs)
  istDate.setUTCHours(0, 0, 0, 0)
  return new Date(istDate.getTime() - istOffsetMs)
}

// ─── Profile ──────────────────────────────────────────────────────────────────

/**
 * GET /api/restaurant/profile
 */
const getProfile = async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.user.restaurantId },
    include: {
      _count: { select: { foodItems: true, categories: true } },
    },
  })
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' })
  return res.json(restaurant)
}

// ─── Mobile Validation Helper ────────────────────────────────────────────────
const validateMobileNumber = (phone) => {
  if (phone === undefined || phone === null) return { valid: true, sanitized: null }
  const trimmed = String(phone).trim()
  if (!trimmed) return { valid: true, sanitized: null }

  let digits = trimmed.replace(/[\s\-()]/g, '')
  if (digits.startsWith('+91')) {
    digits = digits.slice(3)
  } else if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.slice(2)
  } else if (digits.startsWith('0') && digits.length === 11) {
    digits = digits.slice(1)
  }

  if (!/^[6-9]\d{9}$/.test(digits)) {
    return { valid: false }
  }
  if (/^(\d)\1{9}$/.test(digits)) {
    return { valid: false }
  }
  return { valid: true, sanitized: digits }
}

/**
 * PUT /api/restaurant/profile
 * Accepts optional image upload for logo
 */
const updateProfile = async (req, res) => {
  const { name, description, cuisineType, address, phone } = req.body
  const restaurantId = req.user.restaurantId

  const restaurant = await prisma.restaurant.findUnique({ where: { id: restaurantId } })
  if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' })

  const updateData = {}
  if (name !== undefined && name.trim()) updateData.name = name.trim()
  if (description !== undefined) updateData.description = description?.trim() || null
  if (cuisineType !== undefined) updateData.cuisineType = cuisineType?.trim() || null
  if (address !== undefined) updateData.address = address?.trim() || null
  if (phone !== undefined) {
    const phoneCheck = validateMobileNumber(phone)
    if (!phoneCheck.valid) {
      return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number' })
    }
    updateData.phone = phoneCheck.sanitized
  }
  if (req.body.googleReviewUrl !== undefined) {
    updateData.googleReviewUrl = req.body.googleReviewUrl?.trim() || null
  }

  // If a logo file was uploaded
  if (req.file) {
    if (restaurant.logoUrl) {
      await deleteImage(restaurant.logoUrl)
    }
    updateData.logoUrl = await uploadImage(req.file, 'renza/logos')
  }

  const updated = await prisma.restaurant.update({
    where: { id: restaurantId },
    data: updateData,
  })

  return res.json(updated)
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

/**
 * GET /api/restaurant/dashboard
 */
const getDashboard = async (req, res) => {
  const restaurantId = req.user.restaurantId
  const today = todayStart()

  const [
    todayMenuViews,
    todayQrScans,
    todayUnique,
    totalMenuViews,
    totalQrScans,
    totalUnique,
    availableCount,
    unavailableCount,
    totalFoods,
  ] = await Promise.all([
    // Today metrics
    prisma.analyticsEvent.count({
      where: { restaurantId, eventType: 'menu_view', createdAt: { gte: today } },
    }),
    prisma.analyticsEvent.count({
      where: { restaurantId, eventType: 'qr_scan', createdAt: { gte: today } },
    }),
    prisma.analyticsEvent.findMany({
      where: { restaurantId, createdAt: { gte: today } },
      select: { sessionId: true },
      distinct: ['sessionId'],
    }),
    // All-time total metrics (adds every day's view and scan counts)
    prisma.analyticsEvent.count({
      where: { restaurantId, eventType: 'menu_view' },
    }),
    prisma.analyticsEvent.count({
      where: { restaurantId, eventType: 'qr_scan' },
    }),
    prisma.analyticsEvent.findMany({
      where: { restaurantId },
      select: { sessionId: true },
      distinct: ['sessionId'],
    }),
    // Dish counts
    prisma.foodItem.count({ where: { restaurantId, isAvailable: true } }),
    prisma.foodItem.count({ where: { restaurantId, isAvailable: false } }),
    prisma.foodItem.count({ where: { restaurantId } }),
  ])

  // Top 3 food items today by item_view
  const topRaw = await prisma.analyticsEvent.groupBy({
    by: ['foodItemId'],
    where: { restaurantId, eventType: 'item_view', foodItemId: { not: null }, createdAt: { gte: today } },
    _count: { foodItemId: true },
    orderBy: { _count: { foodItemId: 'desc' } },
    take: 3,
  })

  const topItems = await Promise.all(
    topRaw.map(async (t) => {
      const item = await prisma.foodItem.findUnique({
        where: { id: t.foodItemId },
        select: { id: true, name: true, price: true, imageUrl: true },
      })
      return { ...item, viewCount: t._count.foodItemId }
    })
  )

  return res.json({
    today: {
      menuViews: todayMenuViews,
      qrScans: todayQrScans,
      uniqueVisitors: todayUnique.length,
    },
    total: {
      menuViews: totalMenuViews,
      qrScans: totalQrScans,
      uniqueVisitors: totalUnique.length,
    },
    allTime: {
      menuViews: totalMenuViews,
      qrScans: totalQrScans,
      uniqueVisitors: totalUnique.length,
    },
    foodItems: {
      total: totalFoods,
      available: availableCount,
      unavailable: unavailableCount,
    },
    topItems,
  })
}

// ─── Categories ───────────────────────────────────────────────────────────────

/**
 * GET /api/restaurant/categories
 */
const listCategories = async (req, res) => {
  const categories = await prisma.category.findMany({
    where: { restaurantId: req.user.restaurantId },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { foodItems: true } },
      foodItems: {
        select: {
          id: true,
          name: true,
          price: true,
          isAvailable: true,
          imageUrl: true,
          isVeg: true,
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      },
    },
  })
  return res.json(categories)
}

/**
 * POST /api/restaurant/categories
 */
const createCategory = async (req, res) => {
  const { name, sortOrder } = req.body
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Category name is required' })
  }

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      sortOrder: sortOrder !== undefined ? Number(sortOrder) : 0,
      restaurantId: req.user.restaurantId,
    },
  })

  return res.status(201).json(category)
}

/**
 * PUT /api/restaurant/categories/:id
 */
const updateCategory = async (req, res) => {
  const { name, sortOrder } = req.body

  const category = await prisma.category.findUnique({ where: { id: req.params.id } })
  if (!category) return res.status(404).json({ error: 'Category not found' })
  if (category.restaurantId !== req.user.restaurantId) {
    return res.status(403).json({ error: 'Access denied' })
  }

  const updateData = {}
  if (name !== undefined && name.trim()) updateData.name = name.trim()
  if (sortOrder !== undefined) updateData.sortOrder = Number(sortOrder)

  const updated = await prisma.category.update({ where: { id: req.params.id }, data: updateData })
  return res.json(updated)
}

/**
 * DELETE /api/restaurant/categories/:id
 */
const deleteCategory = async (req, res) => {
  const category = await prisma.category.findUnique({ where: { id: req.params.id } })
  if (!category) return res.status(404).json({ error: 'Category not found' })
  if (category.restaurantId !== req.user.restaurantId) {
    return res.status(403).json({ error: 'Access denied' })
  }

  await prisma.category.delete({ where: { id: req.params.id } })
  return res.json({ message: 'Category deleted' })
}

// ─── Food Items ───────────────────────────────────────────────────────────────

/**
 * GET /api/restaurant/foods
 */
const listFoods = async (req, res) => {
  const { categoryId, search } = req.query
  const where = { restaurantId: req.user.restaurantId }
  if (categoryId) where.categoryId = categoryId
  if (search) where.name = { contains: search, mode: 'insensitive' }

  const foods = await prisma.foodItem.findMany({
    where,
    include: { category: { select: { id: true, name: true } } },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
  })

  return res.json(foods)
}

/**
 * GET /api/restaurant/foods/:id
 */
const getFood = async (req, res) => {
  const food = await prisma.foodItem.findUnique({
    where: { id: req.params.id },
    include: { category: { select: { id: true, name: true } } },
  })
  if (!food) return res.status(404).json({ error: 'Food item not found' })
  if (food.restaurantId !== req.user.restaurantId) {
    return res.status(403).json({ error: 'Access denied' })
  }
  return res.json(food)
}

/**
 * POST /api/restaurant/foods
 */
const createFood = async (req, res) => {
  const {
    name,
    price,
    categoryId,
    description,
    ingredients,
    spices,
    allergens,
    portionSize,
    prepTime,
    calories,
    isVeg,
    isJain,
    isVegan,
    isGlutenFree,
    spicyLevel,
    specialTags,
    isAvailable,
    sortOrder,
  } = req.body

  if (!name || !name.trim()) return res.status(400).json({ error: 'Food item name is required' })
  if (price === undefined || price === '') return res.status(400).json({ error: 'Price is required' })

  const parsedPrice = parseFloat(price)
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    return res.status(400).json({ error: 'Price must be a valid non-negative number' })
  }

  // Parse tags if provided as JSON array or string
  let parsedTags = []
  if (req.body.tags) {
    try {
      parsedTags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags
      if (!Array.isArray(parsedTags)) parsedTags = []
    } catch {
      parsedTags = []
    }
  }

  // Resolve dietary flags
  let resolvedVeg = false
  if (isVeg !== undefined) {
    resolvedVeg = isVeg === 'true' || isVeg === true
  } else if (req.body.foodType) {
    resolvedVeg = req.body.foodType === 'veg'
  }

  const resolvedJain = isJain !== undefined
    ? (isJain === 'true' || isJain === true)
    : parsedTags.includes('Jain')

  const resolvedVegan = isVegan !== undefined
    ? (isVegan === 'true' || isVegan === true)
    : parsedTags.includes('Vegan')

  const resolvedGlutenFree = isGlutenFree !== undefined
    ? (isGlutenFree === 'true' || isGlutenFree === true)
    : (parsedTags.includes('Gluten-Free') || parsedTags.includes('Gluten-free'))

  // Sanitize categoryId
  let resolvedCategoryId = null
  if (categoryId && typeof categoryId === 'string') {
    const trimmed = categoryId.trim()
    if (trimmed && trimmed !== 'null' && trimmed !== 'undefined') {
      resolvedCategoryId = trimmed
    }
  }

  // If categoryId provided, verify it belongs to this restaurant
  if (resolvedCategoryId) {
    const cat = await prisma.category.findUnique({ where: { id: resolvedCategoryId } })
    if (!cat || cat.restaurantId !== req.user.restaurantId) {
      return res.status(400).json({ error: 'Invalid category' })
    }
  }

  const imageUrl = req.file ? await uploadImage(req.file, 'renza/dishes') : null

  const food = await prisma.foodItem.create({
    data: {
      restaurantId: req.user.restaurantId,
      categoryId: resolvedCategoryId,
      name: name.trim(),
      price: parsedPrice,
      imageUrl,
      description: description?.trim() || null,
      ingredients: ingredients?.trim() || null,
      spices: spices?.trim() || null,
      allergens: allergens?.trim() || null,
      portionSize: portionSize?.trim() || null,
      prepTime: prepTime?.trim() || null,
      calories: calories ? parseInt(calories) : null,
      isVeg: resolvedVeg,
      isJain: resolvedJain,
      isVegan: resolvedVegan,
      isGlutenFree: resolvedGlutenFree,
      spicyLevel: spicyLevel ? parseInt(spicyLevel) : 0,
      specialTags: specialTags?.trim() || (parsedTags.length > 0 ? parsedTags.join(', ') : null),
      isAvailable: isAvailable === undefined ? true : isAvailable === 'true' || isAvailable === true,
      sortOrder: sortOrder ? parseInt(sortOrder) : 0,
    },
    include: { category: { select: { id: true, name: true } } },
  })

  return res.status(201).json(food)
}

/**
 * PUT /api/restaurant/foods/:id
 */
const updateFood = async (req, res) => {
  const existing = await prisma.foodItem.findUnique({ where: { id: req.params.id } })
  if (!existing) return res.status(404).json({ error: 'Food item not found' })
  if (existing.restaurantId !== req.user.restaurantId) {
    return res.status(403).json({ error: 'Access denied' })
  }

  const {
    name,
    price,
    categoryId,
    description,
    ingredients,
    spices,
    allergens,
    portionSize,
    prepTime,
    calories,
    isVeg,
    isJain,
    isVegan,
    isGlutenFree,
    spicyLevel,
    specialTags,
    isAvailable,
    sortOrder,
  } = req.body

  const updateData = {}

  if (name !== undefined && name.trim()) updateData.name = name.trim()
  if (price !== undefined && price !== '') {
    const parsedPrice = parseFloat(price)
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      return res.status(400).json({ error: 'Price must be a valid non-negative number' })
    }
    updateData.price = parsedPrice
  }

  if (categoryId !== undefined) {
    let resolvedCategoryId = null
    if (categoryId && typeof categoryId === 'string') {
      const trimmed = categoryId.trim()
      if (trimmed && trimmed !== 'null' && trimmed !== 'undefined') {
        resolvedCategoryId = trimmed
      }
    }
    if (resolvedCategoryId) {
      const cat = await prisma.category.findUnique({ where: { id: resolvedCategoryId } })
      if (!cat || cat.restaurantId !== req.user.restaurantId) {
        return res.status(400).json({ error: 'Invalid category' })
      }
    }
    updateData.categoryId = resolvedCategoryId
  }

  // Parse tags if provided
  let parsedTags = null
  if (req.body.tags !== undefined) {
    try {
      parsedTags = typeof req.body.tags === 'string' ? JSON.parse(req.body.tags) : req.body.tags
      if (!Array.isArray(parsedTags)) parsedTags = null
    } catch {
      parsedTags = null
    }
  }

  if (description !== undefined) updateData.description = description?.trim() || null
  if (ingredients !== undefined) updateData.ingredients = ingredients?.trim() || null
  if (spices !== undefined) updateData.spices = spices?.trim() || null
  if (allergens !== undefined) updateData.allergens = allergens?.trim() || null
  if (portionSize !== undefined) updateData.portionSize = portionSize?.trim() || null
  if (prepTime !== undefined) updateData.prepTime = prepTime?.trim() || null
  if (calories !== undefined) updateData.calories = calories ? parseInt(calories) : null

  if (isVeg !== undefined) {
    updateData.isVeg = isVeg === 'true' || isVeg === true
  } else if (req.body.foodType !== undefined) {
    updateData.isVeg = req.body.foodType === 'veg'
  }

  if (isJain !== undefined) {
    updateData.isJain = isJain === 'true' || isJain === true
  } else if (parsedTags) {
    updateData.isJain = parsedTags.includes('Jain')
  }

  if (isVegan !== undefined) {
    updateData.isVegan = isVegan === 'true' || isVegan === true
  } else if (parsedTags) {
    updateData.isVegan = parsedTags.includes('Vegan')
  }

  if (isGlutenFree !== undefined) {
    updateData.isGlutenFree = isGlutenFree === 'true' || isGlutenFree === true
  } else if (parsedTags) {
    updateData.isGlutenFree = parsedTags.includes('Gluten-Free') || parsedTags.includes('Gluten-free')
  }

  if (spicyLevel !== undefined) updateData.spicyLevel = parseInt(spicyLevel) || 0
  if (specialTags !== undefined) {
    updateData.specialTags = specialTags?.trim() || null
  } else if (parsedTags) {
    updateData.specialTags = parsedTags.length > 0 ? parsedTags.join(', ') : null
  }

  if (isAvailable !== undefined) updateData.isAvailable = isAvailable === 'true' || isAvailable === true
  if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder) || 0

  // If a new image was uploaded
  if (req.file) {
    if (existing.imageUrl) {
      await deleteImage(existing.imageUrl)
    }
    updateData.imageUrl = await uploadImage(req.file, 'renza/dishes')
  }

  const updated = await prisma.foodItem.update({
    where: { id: req.params.id },
    data: updateData,
    include: { category: { select: { id: true, name: true } } },
  })

  return res.json(updated)
}

/**
 * DELETE /api/restaurant/foods/:id
 */
const deleteFood = async (req, res) => {
  const food = await prisma.foodItem.findUnique({ where: { id: req.params.id } })
  if (!food) return res.status(404).json({ error: 'Food item not found' })
  if (food.restaurantId !== req.user.restaurantId) {
    return res.status(403).json({ error: 'Access denied' })
  }

  if (food.imageUrl) {
    await deleteImage(food.imageUrl)
  }

  await prisma.foodItem.delete({ where: { id: req.params.id } })
  return res.json({ message: 'Food item deleted' })
}

/**
 * PATCH /api/restaurant/foods/:id/availability
 * Toggle isAvailable
 */
const toggleAvailability = async (req, res) => {
  const food = await prisma.foodItem.findUnique({ where: { id: req.params.id } })
  if (!food) return res.status(404).json({ error: 'Food item not found' })
  if (food.restaurantId !== req.user.restaurantId) {
    return res.status(403).json({ error: 'Access denied' })
  }

  const updated = await prisma.foodItem.update({
    where: { id: req.params.id },
    data: { isAvailable: !food.isAvailable },
  })

  return res.json({ isAvailable: updated.isAvailable, food: updated })
}

/**
 * GET /api/restaurant/qr
 * Returns generated QR code for current restaurant
 */
const getMyQRCode = async (req, res) => {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: req.user.restaurantId },
  })
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
    width: 600,
    color: { dark: '#000000', light: '#FFFFFF' },
  })

  return res.json({
    qrDataUrl,
    qrCodeUrl: qrDataUrl,
    menuUrl,
    slug: restaurant.slug,
    name: restaurant.name,
    customMenuUrl: restaurant.customMenuUrl || null,
    defaultUrl,
  })
}

module.exports = {
  getProfile,
  updateProfile,
  getDashboard,
  getMyQRCode,
  listCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  listFoods,
  getFood,
  createFood,
  updateFood,
  deleteFood,
  toggleAvailability,
}
