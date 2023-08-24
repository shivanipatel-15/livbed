const express = require('express')
const { protectRouteWithRole } = require('../middleware/auth.middleware')
const { ROLE_PATIENT, ROLE_DOCTOR } = require('../utility/constant')

const patient = require('./patient.route')
const doctor = require('./doctor.route')
const hospital = require('./hospital.route')
const diseases = require('./diseases.route')
const consultation = require('./consultation.route')

const app = express()
app.use('/api/v1/patient', patient)
app.use('/api/v1/doctor', doctor)
app.use('/api/v1/hospital', hospital)
app.use('/api/v1/diseases', diseases)
app.use('/api/v1/auth/doctor', [protectRouteWithRole([ROLE_PATIENT, ROLE_DOCTOR])], doctor)
app.use('/api/v1/auth/consultation', [protectRouteWithRole([ROLE_PATIENT, ROLE_DOCTOR])], consultation)
app.use('/api/v1/auth/patient', [protectRouteWithRole([ROLE_PATIENT])], patient)

module.exports = app
