const express = require('express')
const router = express.Router()
const festiveController = require('../controllers/festive.controller')
const { authenticate, requireSuperAdmin } = require('../middleware/auth')

// ─── Super Admin Exclusive Festive Theme Management ─────────────────────────
router.get('/config', authenticate, requireSuperAdmin, festiveController.getFestiveConfig)
router.post('/save', authenticate, requireSuperAdmin, festiveController.saveFestiveSettings)
router.patch('/restaurants/:id/toggle', authenticate, requireSuperAdmin, festiveController.toggleSingleRestaurant)

module.exports = router
