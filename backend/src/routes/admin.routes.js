const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin.controller')
const { authenticate, requireSuperAdmin } = require('../middleware/auth')

// All admin routes require superadmin role
router.use(authenticate, requireSuperAdmin)

// Restaurants
router.get('/restaurants', adminController.listRestaurants)
router.post('/restaurants', adminController.createRestaurant)
router.get('/restaurants/:id', adminController.getRestaurant)
router.put('/restaurants/:id', adminController.updateRestaurant)
router.patch('/restaurants/:id/status', adminController.toggleStatus)
router.get('/restaurants/:id/analytics', adminController.getAnalytics)
router.get('/restaurants/:id/qr', adminController.getQRCode)
router.patch('/restaurants/:id/qr-url', adminController.updateQRUrl)
router.delete('/restaurants/:id', adminController.deleteRestaurant)

module.exports = router
