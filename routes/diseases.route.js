const express = require('express')
const router = express.Router()
const diseasesController = require('../controllers/diseases.controller')

router.post('/list', diseasesController.list)

module.exports = router