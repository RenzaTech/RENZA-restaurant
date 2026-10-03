const express = require('express')
const router = express.Router()
const adminController = require('../controllers/admin.controller')
const { authenticate, requireSuperAdmin, requireSalesOrSuperAdmin } = require('../middleware/auth')

// ─── Shared Routes (Accessible by Sales Executive & Super Admin) ──────────────
router.get('/restaurants', authenticate, requireSalesOrSuperAdmin, adminController.listRestaurants)
router.post('/restaurants', authenticate, requireSalesOrSuperAdmin, adminController.createRestaurant)
router.get('/restaurants/:id', authenticate, requireSalesOrSuperAdmin, adminController.getRestaurant)
router.get('/restaurants/:id/qr', authenticate, requireSalesOrSuperAdmin, adminController.getQRCode)
router.get('/restaurants/:id/tables', authenticate, requireSalesOrSuperAdmin, adminController.listRestaurantTables)
router.get('/restaurants/:id/tables/:tableId/qr', authenticate, requireSalesOrSuperAdmin, adminController.getTableQR)
router.post('/restaurants/:id/tables/:tableId/qr', authenticate, requireSalesOrSuperAdmin, adminController.getTableQR)

// ─── Super Admin Exclusive Governance & Management Routes ────────────────────
router.put('/restaurants/:id', authenticate, requireSuperAdmin, adminController.updateRestaurant)
router.patch('/restaurants/:id/status', authenticate, requireSuperAdmin, adminController.toggleStatus)
router.get('/restaurants/:id/analytics', authenticate, requireSuperAdmin, adminController.getAnalytics)
router.patch('/restaurants/:id/qr-url', authenticate, requireSuperAdmin, adminController.updateQRUrl)
router.delete('/restaurants/:id', authenticate, requireSuperAdmin, adminController.deleteRestaurant)

// ─── Super Admin Exclusive Employee Management Routes ─────────────────────────
router.get('/employees', authenticate, requireSuperAdmin, adminController.listEmployees)
router.post('/employees', authenticate, requireSuperAdmin, adminController.createEmployee)
router.put('/employees/:id', authenticate, requireSuperAdmin, adminController.updateEmployee)
router.delete('/employees/:id', authenticate, requireSuperAdmin, adminController.deleteEmployee)

module.exports = router

