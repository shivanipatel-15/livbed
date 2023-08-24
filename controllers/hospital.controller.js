const bcrypt = require('bcrypt')
const {
    successResponse,
    errorResponse,
    catchResponse
} = require('../utility')
const {
    registerValidation
} = require('./validation/hospital.validation')
const Hospital = require('../models/hospital.model')

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/hospital/register (Register Patient)
 * @access public
 * @returns {*} result
 */
exports.register = async function (req, res) {
    const { error, isValid } = registerValidation(req.body)
    if (!isValid) {
        return errorResponse(res, error, 'Invalid Request', 400)
    }

    try {
        const hospital = await Hospital.findOne({ mobile_no: req.body.mobile_no, status: { $ne: 'deleted' } })
        if (hospital != null) {
            return errorResponse(res, {}, 'Hospital already exists with same mobile number', 500)
        }

        const hospitalData = {
            hospital_name: req.body.hospital_name,
            mobile_no: req.body.mobile_no,
            hospital_type: req.body.hospital_type,
            address: {
                address1: req.body.address1,
                address2: req.body.address2,
                zip: req.body.zip,
                city: req.body.city,
                state: req.body.state,
                country: req.body.country,
                location: {
                    type: 'Point',
                    coordinates: [req.body.latitude, req.body.longitude]
                }
            },
            beds: {
                general_bads: { total: req.body.general_bads || 0 },
                o2_bads: { total: req.body.o2_bads || 0 },
                without_o2_bads: { total: req.body.without_o2_bads || 0 },
                hcu_hfnc_bads: { total: req.body.hcu_hfnc_bads || 0 },
                icu_withoutventilator_bads: { total: req.body.icu_withoutventilator_bads || 0 },
                icu_ventilator_bads: { total: req.body.icu_ventilator_bads || 0 }
            },
            tc_accepted: req.body.tc_accepted
        }

        const passwordHash = await bcrypt.hash(req.body.password, 10)
        hospitalData.password = passwordHash

        const newHospital = new Hospital(hospitalData)
        const saveHospital = await newHospital.save()

        if (saveHospital == null) {
            return errorResponse(res, {}, 'Something went wrong! Hospital not registered', 500)
        }

        const response = {
            hospital_id: saveHospital._id
        }

        return successResponse(res, response, 'Hospital Successfully Registered', 200)

    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/hospital/list (Register Patient)
 * @access public
 * @returns {*} result
 */
exports.list = async function (req, res) {
    try {
        const limit = 50
        const offset = (req.query.page - 1) * limit
        let query = {
            status: 'active'
        }
        if (req.body.hospital_name) {
            const hospital_name_regex = new RegExp(`/.*${req.body.hospital_name}.*/`)
            query.hospital_name = { $regex: hospital_name_regex }
        }
        if (req.body.city) {
            query['address.city'] = req.body.city
        }
        if (req.body.hospital_type) {
            query.hospital_type = req.body.hospital_type
        }
        let match = {}
        if (req.body.latitude && req.body.longitude) {
            match = {
                $geoNear: {
                    near: {
                        type: "Point",
                        coordinates: [parseFloat(req.body.longitude), parseFloat(req.body.latitude)]
                    },
                    distanceField: "distance",
                    distanceMultiplier: 1/1000,
                    query: query
                }
            }
        } else {
            match = { $match: query }
        }
        const select = {
            __v: 0,
            createdAt: 0,
            tc_accepted: 0,
            password: 0,
            status: 0
        }
        const sort = { hospital_name: 1 }
        const aggregate = [
            match,
            { $limit: limit },
            { $skip: offset },
            { $project: select },
            { $sort: sort }
        ]
        const hospital = await Hospital.aggregate(aggregate)
        const response = {
            hospitals: hospital
        }
        return successResponse(res, response, 'Hospital List', 200)

    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}