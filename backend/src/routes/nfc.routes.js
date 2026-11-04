const express = require('express')
const router = express.Router()
const nfcController = require('../controllers/nfc.controller')

// Public tap / QR redirect lookup (called by review-website on customer tap)
router.get('/cards/lookup/:code', nfcController.getCardByCode)

// Restaurant list for generator dropdown
router.get('/restaurants', nfcController.listRestaurants)

// Card CRUD & Controls
router.get('/cards', nfcController.listCards)
router.post('/cards', nfcController.createCard)
router.patch('/cards/:id/toggle', nfcController.toggleCardStatus)
router.patch('/cards/:id', nfcController.updateCard)
router.delete('/cards/:id', nfcController.deleteCard)

module.exports = router
