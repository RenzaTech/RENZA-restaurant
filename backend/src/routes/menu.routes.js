const express = require('express')
const router = express.Router()
const menuController = require('../controllers/menu.controller')

// Public routes — no authentication required
router.get('/:slug', menuController.getMenu)
router.post('/:slug/track', menuController.trackEvent)

module.exports = router
