const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: {
      restaurant: {
        select: { id: true, name: true, slug: true, status: true },
      },
    },
  })

  if (!user) {
    return res.status(401).json({ error: 'User not found with this email' })
  }

  const isValid = await bcrypt.compare(password, user.passwordHash)
  if (!isValid) {
    return res.status(401).json({ error: 'Incorrect password' })
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
    restaurantId: user.restaurantId,
    name: user.name,
    pwh: user.passwordHash ? user.passwordHash.slice(-10) : undefined,
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' })

  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      restaurantId: user.restaurantId,
      restaurant: user.restaurant,
    },
  })
}

/**
 * GET /api/auth/me
 */
const me = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      restaurant:
        req.user.role === 'restaurant_admin'
          ? { select: { id: true, name: true, slug: true, status: true, logoUrl: true } }
          : false,
    },
  })

  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }

  return res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    restaurantId: user.restaurantId,
    restaurant: user.restaurant || null,
  })
}

module.exports = { login, me }
