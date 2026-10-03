const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')

/**
 * Middleware: Verify JWT token and ensure session is still valid against the database.
 * If user email, role, or password was changed, the old session is immediately invalidated.
 */
const authenticate = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Verify user exists and check for credential/email changes
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        role: true,
        restaurantId: true,
        name: true,
        passwordHash: true,
        employeeId: true,
        department: true,
        territory: true,
        phone: true,
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'Account not found or session revoked. Please sign in again.' })
    }

    // Invalidate session immediately if email was changed
    if (decoded.email && user.email.toLowerCase() !== decoded.email.toLowerCase()) {
      return res.status(401).json({
        error: 'Session expired: account email was updated. Please sign in with your new email.',
      })
    }

    // Invalidate session if role was modified
    if (user.role !== decoded.role) {
      return res.status(401).json({
        error: 'Session expired: account permissions were updated. Please sign in again.',
      })
    }

    // Invalidate session if password was changed (for tokens containing pwh signature)
    if (decoded.pwh && user.passwordHash.slice(-10) !== decoded.pwh) {
      return res.status(401).json({
        error: 'Session expired: account password was changed. Please sign in again.',
      })
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      restaurantId: user.restaurantId,
      name: user.name,
      employeeId: user.employeeId,
      department: user.department,
      territory: user.territory,
      phone: user.phone,
    }
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Middleware: Require superadmin role
 */
const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ error: 'Superadmin access required' })
  }
  next()
}

/**
 * Middleware: Require restaurant_admin OR superadmin role
 */
const requireRestaurantAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'restaurant_admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ error: 'Restaurant admin access required' })
  }
  next()
}

/**
 * Middleware: Require sales_executive role
 */
const requireSalesExecutive = (req, res, next) => {
  if (!req.user || req.user.role !== 'sales_executive') {
    return res.status(403).json({ error: 'Sales executive access required' })
  }
  next()
}

/**
 * Middleware: Require sales_executive OR superadmin role
 */
const requireSalesOrSuperAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'sales_executive' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ error: 'Sales Executive or Super Admin access required' })
  }
  next()
}

module.exports = { authenticate, requireSuperAdmin, requireRestaurantAdmin, requireSalesExecutive, requireSalesOrSuperAdmin }
