const cloudinary = require('cloudinary').v2
const path = require('path')
const fs = require('fs')
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false } })
  : null

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
 * Upload a multer file to Supabase Storage (preferred), Cloudinary, or local disk
 * @param {Express.Multer.File} file 
 * @param {string} folder Bucket folder name (e.g. 'renza/dishes', 'renza/logos')
 * @returns {Promise<string|null>} Permanent public image URL
 */
async function uploadImage(file, folder = 'renza') {
  if (!file) return null

  // 1. Supabase Storage (Primary)
  if (supabase) {
    try {
      const fileBuffer = fs.readFileSync(file.path)
      const sanitizedFilename = (file.originalname || 'image.jpg').replace(/\s+/g, '_')
      const filePath = `${folder}/${Date.now()}-${sanitizedFilename}`

      const { data, error } = await supabase.storage
        .from('renza-media')
        .upload(filePath, fileBuffer, {
          contentType: file.mimetype || 'image/jpeg',
          upsert: true,
        })

      if (!error && data) {
        const { data: publicData } = supabase.storage
          .from('renza-media')
          .getPublicUrl(filePath)

        // Clean up temp file
        try {
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
        } catch (_) {}

        return publicData.publicUrl
      } else if (error) {
        console.warn('[Storage] Supabase upload error, trying fallback:', error.message)
      }
    } catch (supabaseErr) {
      console.warn('[Storage] Supabase upload failed, falling back:', supabaseErr.message)
    }
  }

  // 2. Cloudinary (Secondary Fallback)
  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'image',
        transformation: [
          { quality: 'auto', fetch_format: 'auto' }
        ]
      })

      try {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path)
      } catch (_) {}

      return result.secure_url
    } catch (err) {
      console.error('[Storage] Cloudinary upload failed, using local storage:', err.message)
    }
  }

  // 3. Local server URL fallback
  const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`
  return `${backendUrl}/uploads/${file.filename}`
}

/**
 * Helper to delete an image from Supabase, Cloudinary, or local disk
 * @param {string} url 
 */
async function deleteImage(url) {
  if (!url) return

  // Supabase delete
  if (supabase && url.includes('supabase.co/storage/v1/object/public/renza-media/')) {
    try {
      const filePath = url.split('/renza-media/')[1]
      if (filePath) {
        await supabase.storage.from('renza-media').remove([filePath])
      }
    } catch (err) {
      console.warn('[Storage] Supabase delete failed:', err.message)
    }
    return
  }

  // Cloudinary delete
  if (isCloudinaryConfigured && url.includes('cloudinary.com')) {
    try {
      const parts = url.split('/')
      const uploadIdx = parts.indexOf('upload')
      if (uploadIdx !== -1) {
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
