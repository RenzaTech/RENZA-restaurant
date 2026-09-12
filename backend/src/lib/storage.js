const cloudinary = require('cloudinary').v2
const path = require('path')
const fs = require('fs')

const isCloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
)

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

/**
 * Upload a multer file to Cloudinary (if configured) or return the local file URL
 * @param {Express.Multer.File} file 
 * @param {string} folder Cloudinary folder name (e.g. 'renza/dishes', 'renza/logos')
 * @returns {Promise<string|null>} Permanent public image URL
 */
async function uploadImage(file, folder = 'renza') {
  if (!file) return null

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' } // Auto-compress & WebP conversion
        ]
      })

      // Clean up temp file on local disk
      try {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path)
        }
      } catch (cleanupErr) {
        console.warn('[Storage] Could not remove temp file:', cleanupErr.message)
      }

      return result.secure_url
    } catch (err) {
      console.error('[Storage] Cloudinary upload failed, using local storage:', err.message)
    }
  }

  // Fallback to local server URL
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
  return `${backendUrl}/uploads/${file.filename}`
}

/**
 * Helper to delete an image if needed
 * @param {string} url 
 */
async function deleteImage(url) {
  if (!url) return

  if (isCloudinaryConfigured && url.includes('cloudinary.com')) {
    try {
      // Extract public ID from Cloudinary URL
      const parts = url.split('/')
      const uploadIdx = parts.indexOf('upload')
      if (uploadIdx !== -1) {
        // Skip version if present (e.g. v123456789)
        let publicIdParts = parts.slice(uploadIdx + 1)
        if (publicIdParts[0].startsWith('v') && /^\d+$/.test(publicIdParts[0].slice(1))) {
          publicIdParts = publicIdParts.slice(1)
        }
        const fullFileName = publicIdParts.join('/')
        const publicId = fullFileName.substring(0, fullFileName.lastIndexOf('.'))
        await cloudinary.uploader.destroy(publicId)
      }
    } catch (err) {
      console.warn('[Storage] Cloudinary delete failed:', err.message)
    }
    return
  }

  // Local file deletion
  try {
    const filename = path.basename(url)
    const localPath = path.join(__dirname, '..', '..', 'uploads', filename)
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath)
    }
  } catch (err) {
    console.warn('[Storage] Local file delete failed:', err.message)
  }
}

module.exports = {
  isCloudinaryConfigured,
  uploadImage,
  deleteImage,
}
