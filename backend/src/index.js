require('dotenv').config()
require('express-async-errors')

const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')

const authRoutes = require('./routes/auth.routes')
const adminRoutes = require('./routes/admin.routes')
const restaurantRoutes = require('./routes/restaurant.routes')
const menuRoutes = require('./routes/menu.routes')

const app = express()

// ─── Ensure uploads directory exists ────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// ─── CORS ────────────────────────────────────────────────────────────────────
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:3001')
  .split(',')
  .map((o) => o.trim())

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin or matching origins or wildcard
      if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error(`CORS: Origin ${origin} not allowed`))
      }
    },
    credentials: true,
  })
)

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── Static files (uploaded images) ─────────────────────────────────────────
app.use('/uploads', express.static(uploadsDir))

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/restaurant', restaurantRoutes)
app.use('/api/menu', menuRoutes)

// ─── Health check ────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── 404 handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ─── Global error handler ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[ERROR]', err)

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large. Maximum size is 5MB.' })
  }
  if (err.message && err.message.includes('Only JPEG')) {
    return res.status(400).json({ error: err.message })
  }

  // Prisma known errors
  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'A record with that value already exists.' })
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Record not found.' })
  }

  res.status(500).json({ error: 'Internal server error' })
})

// ─── Start server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Renza backend running on http://localhost:${PORT}`)
    console.log(`   Uploads served at http://localhost:${PORT}/uploads`)
    console.log(`   Allowed origins: ${allowedOrigins.join(', ')}`)
  })
}

module.exports = app
