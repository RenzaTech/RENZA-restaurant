const jwt = require('jsonwebtoken')

/**
 * Middleware: Verify JWT token and attach user to req.user
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization']
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      restaurantId: decoded.restaurantId,
      name: decoded.name,
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

module.exports = { authenticate, requireSuperAdmin, requireRestaurantAdmin }
