const express = require('express')
const router = express.Router()
const doctorController = require('../controllers/doctor.controller')

// user routes for app
router.post('/register', doctorController.register)
router.post('/login', doctorController.login)
router.post('/varify-otp', doctorController.varifyOtp)
router.post('/search', doctorController.searchProfile)
router.post('/profile/:id', doctorController.viewProfile)
router.post('/dashboard', doctorController.dashboard)

module.exports = router