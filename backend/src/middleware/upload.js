const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure uploads directory exists
const uploadsDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true })
  } catch (err) {
    console.warn('[Upload] Could not create uploadsDir:', err.message)
  }
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (_req, file, cb) => {
    const sanitizedName = file.originalname.replace(/\s+/g, '_')
    cb(null, `${Date.now()}-${sanitizedName}`)
  },
})

const fileFilter = (_req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPEG, JPG, PNG and WebP images are allowed'), false)
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

const uploadAny = upload.any()

const uploadSingle = (req, res, next) => {
  const contentType = req.headers['content-type'] || ''
  if (!contentType.includes('multipart/form-data')) {
    return next()
  }
  uploadAny(req, res, (err) => {
    if (err) {
      if (err.message && err.message.includes('Boundary not found')) {
        console.warn('[Upload] Multipart boundary missing, skipping file parse:', err.message)
        return next()
      }
      return next(err)
    }
    if (req.files && req.files.length > 0) {
      // Find 'image' or 'frontImage' or 'logo' or fallback to first file
      req.file =
        req.files.find((f) => f.fieldname === 'image' || f.fieldname === 'frontImage' || f.fieldname === 'logo') ||
        req.files[0]

      // Find top view dish photo if provided
      req.topViewFile =
        req.files.find((f) => f.fieldname === 'topViewImage' || f.fieldname === 'top_view_image') || null
    }
    next()
  })
}

module.exports = { uploadSingle }
