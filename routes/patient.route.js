const express = require('express')
const router = express.Router()
const patientController = require('../controllers/patient.controller')

// user routes for app
router.post('/register', patientController.register)
router.post('/login', patientController.login)
router.post('/varify-otp', patientController.varifyOtp)
router.post('/me', patientController.loginPatientProfile)
router.post('/editProfile', patientController.editProfile)
router.post('/dashboard', patientController.dashboard)

module.exports = router