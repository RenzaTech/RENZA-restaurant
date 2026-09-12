const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', '..', 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
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
  uploadAny(req, res, (err) => {
    if (err) return next(err)
    if (req.files && req.files.length > 0) {
      // Find 'image' or 'logo' or fallback to first file
      req.file =
        req.files.find((f) => f.fieldname === 'image' || f.fieldname === 'logo') ||
        req.files[0]
    }
    next()
  })
}

module.exports = { uploadSingle }
