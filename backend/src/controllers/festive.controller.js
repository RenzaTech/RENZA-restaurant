const prisma = require('../lib/prisma')

/**
 * GET /api/admin/festive/config
 * Retrieves current festival configuration and all restaurants with festive status.
 */
const getFestiveConfig = async (req, res) => {
  try {
    const restaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        status: true,
        festiveThemeEnabled: true,
        festiveThemeName: true,
        festiveAnimationDuration: true,
        createdAt: true,
      },
      orderBy: [{ name: 'asc' }],
    })

    const total = restaurants.length
    const enabledCount = restaurants.filter((r) => r.festiveThemeEnabled).length

    // Default duration from first enabled restaurant, or standard default 5s
    const activeDuration =
      restaurants.find((r) => r.festiveThemeEnabled)?.festiveAnimationDuration || 5

    return res.json({
      success: true,
      activeFestival: 'diwali',
      festivalDisplayName: 'Diwali Festival 2026',
      defaultDuration: activeDuration,
      stats: {
        total,
        enabledCount,
        disabledCount: total - enabledCount,
      },
      restaurants,
    })
  } catch (error) {
    console.error('[Festive Config Error]', error)
    return res.status(500).json({ error: 'Failed to load festival configuration', details: error.message })
  }
}

/**
 * POST /api/admin/festive/save
 * Batch saves selected restaurants and animation duration.
 * Body: { restaurantIds: string[], durationSeconds: number, selectAll?: boolean, deselectAll?: boolean, themeName?: string }
 */
const saveFestiveSettings = async (req, res) => {
  try {
    const { restaurantIds = [], durationSeconds = 5, selectAll = false, deselectAll = false, themeName = 'diwali' } = req.body

    const parsedDuration = Math.max(2, Math.min(30, parseInt(durationSeconds, 10) || 5))

    if (deselectAll) {
      await prisma.restaurant.updateMany({
        data: {
          festiveThemeEnabled: false,
        },
      })
    } else if (selectAll) {
      await prisma.restaurant.updateMany({
        data: {
          festiveThemeEnabled: true,
          festiveThemeName: themeName,
          festiveAnimationDuration: parsedDuration,
        },
      })
    } else {
      // 1. Enable selected restaurants with chosen duration
      if (restaurantIds.length > 0) {
        await prisma.restaurant.updateMany({
          where: {
            id: { in: restaurantIds },
          },
          data: {
            festiveThemeEnabled: true,
            festiveThemeName: themeName,
            festiveAnimationDuration: parsedDuration,
          },
        })
      }

      // 2. Disable unselected restaurants
      await prisma.restaurant.updateMany({
        where: {
          id: { notIn: restaurantIds },
        },
        data: {
          festiveThemeEnabled: false,
        },
      })
    }

    // Return refreshed list
    const updatedRestaurants = await prisma.restaurant.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        status: true,
        festiveThemeEnabled: true,
        festiveThemeName: true,
        festiveAnimationDuration: true,
      },
      orderBy: [{ name: 'asc' }],
    })

    const total = updatedRestaurants.length
    const enabledCount = updatedRestaurants.filter((r) => r.festiveThemeEnabled).length

    return res.json({
      success: true,
      message: 'Festival theme settings updated successfully',
      stats: {
        total,
        enabledCount,
        disabledCount: total - enabledCount,
      },
      durationSeconds: parsedDuration,
      restaurants: updatedRestaurants,
    })
  } catch (error) {
    console.error('[Festive Save Error]', error)
    return res.status(500).json({ error: 'Failed to save festival settings', details: error.message })
  }
}

/**
 * PATCH /api/admin/festive/restaurants/:id/toggle
 * Toggles festival theme for a single restaurant.
 * Body: { enabled?: boolean, durationSeconds?: number, themeName?: string }
 */
const toggleSingleRestaurant = async (req, res) => {
  try {
    const { id } = req.params
    const { enabled, durationSeconds, themeName = 'diwali' } = req.body

    const existing = await prisma.restaurant.findUnique({
      where: { id },
      select: { id: true, festiveThemeEnabled: true, festiveAnimationDuration: true },
    })

    if (!existing) {
      return res.status(404).json({ error: 'Restaurant not found' })
    }

    const nextEnabled = typeof enabled === 'boolean' ? enabled : !existing.festiveThemeEnabled
    const nextDuration = durationSeconds ? Math.max(2, Math.min(30, parseInt(durationSeconds, 10))) : existing.festiveAnimationDuration || 5

    const updated = await prisma.restaurant.update({
      where: { id },
      data: {
        festiveThemeEnabled: nextEnabled,
        festiveThemeName: themeName,
        festiveAnimationDuration: nextDuration,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        status: true,
        festiveThemeEnabled: true,
        festiveThemeName: true,
        festiveAnimationDuration: true,
      },
    })

    return res.json({
      success: true,
      restaurant: updated,
    })
  } catch (error) {
    console.error('[Festive Toggle Error]', error)
    return res.status(500).json({ error: 'Failed to toggle restaurant festival theme', details: error.message })
  }
}

module.exports = {
  getFestiveConfig,
  saveFestiveSettings,
  toggleSingleRestaurant,
}
