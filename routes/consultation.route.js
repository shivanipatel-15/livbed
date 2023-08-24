const express = require('express')
const router = express.Router()
const consultationController = require('../controllers/consultation.controller')

router.post('/book_appointment', consultationController.bookAppointment)
router.post('/appointments', consultationController.myAppointment)
router.post('/add_symptoms', consultationController.addSymtoms)
router.post('/appointment/:id', consultationController.appointmentDetail)

module.exports = router