const {
    successResponse,
    errorResponse,
    catchResponse,
    generateJwtAuthToken,
    isEmpty,
    getObjectId
} = require('../utility')
const { sendOTP } = require('../utility/notification')
const {
    loginValidation,
    registerValidation,
    otpValidation
} = require('./validation/doctor.validation')
const Doctor = require('../models/doctor.model')
const { ROLE_DOCTOR } = require('../utility/constant')
const { uploadMediaToS3 } = require('../utility/upload')
const Appointment = require('../models/appointment.model')
const moment = require('moment')

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/doctor/register (Register Doctor)
 * @access public
 * @returns {*} result
 */
exports.register = async function (req, res) {
    const { error, isValid } = registerValidation(req.body)
    if (!isValid) {
        return errorResponse(res, error, 'Invalid Request', 400)
    }

    try {
        const doctor = await Doctor.findOne({ mobile_no: req.body.mobile_no, status: { $ne: 'deleted' }, profile_status: 'otp_varified' })
        if (doctor == null) {
            return errorResponse(res, {}, 'Doctor already exists with same mobile number', 400)
        }
        const doctorId = doctor._id || 0
        if (!isEmpty(req.files)) {
            if (!isEmpty(req.files.id_proff)) {
                const idProff = req.files.id_proff
                const file = idProff.data
                const mimetype = idProff.mimetype
                const file_name = idProff.name
                const uploadPath = `doctor/${doctorId}`
                try {
                    const uploadIdProff = await uploadMediaToS3(file, mimetype, file_name, uploadPath)
                    if (uploadIdProff.success != true) {
                        let uploadError = {
                            success: true,
                            error: uploadIdProff.response.code,
                            message: uploadIdProff.message
                        }
                        return errorResponse(res, uploadError, uploadIdProff.message != null ? uploadIdProff.message : 'Error! Image not Upload.', 200)
                    }
                    doctor.id_proff = uploadIdProff.response.Key
                } catch (err) {
                    console.log(err)
                    return errorResponse(res, {}, 'ID proff not uploaded on s3', 200)
                }
                
            }
            
            if (!isEmpty(req.files.medical_registration_proof)) {
                const medicalRegProff = req.files.medical_registration_proof
                const file = medicalRegProff.data
                const mimetype = medicalRegProff.mimetype
                const file_name = medicalRegProff.name
                const uploadPath = `/doctor/${doctorId}`
                try {
                    const uploadMedicalRegProff = await uploadMediaToS3(file, mimetype, file_name, uploadPath)
                    if (uploadMedicalRegProff.success != true) {
                        let uploadError = {
                            success: true,
                            error: medicalRegProff.response.code,
                            message: medicalRegProff.message
                        }
                        return errorResponse(res, uploadError, uploadMedicalRegProff.message != null ? uploadMedicalRegProff.message : 'Error! Image not Upload.', 200)
                    }
                } catch (err) {
                    return errorResponse(res, {}, 'Medical Proof not uploaded on s3', 200)
                }
                doctor.medical_registration_proof = uploadMedicalRegProff.response.Key
            }
        }
        doctor.first_name = req.body.first_name
        doctor.last_name = req.body.last_name
        doctor.mobile_no = req.body.mobile_no
        doctor.tc_accepted = req.body.tc_accepted
        doctor.specialization = req.body.specialization
        doctor.gender = req.body.gender
        doctor.city = req.body.city
        doctor.degree = req.body.degree
        doctor.collage = req.body.collage
        doctor.year_of_completion = req.body.year_of_completion
        doctor.year_of_experience = req.body.year_of_experience
        doctor.registration_number = req.body.registration_number
        doctor.registration_council = req.body.registration_council
        doctor.registration_year = req.body.registration_year
        doctor.is_practicing = req.body.is_practicing
        doctor.hospital_name = req.body.hospital_name
        doctor.device_type = req.body.device_type
        doctor.fcm_token = req.body.fcm_token
        doctor.profile_status = 'completed'
        const saveDoctor = await doctor.save()

        if (doctor == null) {
            return errorResponse(res, {}, 'Something went wrong! User not registered', 400)
        }

        const token = generateJwtAuthToken(saveDoctor._id, ROLE_DOCTOR)
        return successResponse(res, { token: token, profile_status: doctor.profile_status }, 'Successfully Registered', 200)
    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/doctor/login (Login User)
 * @access public
 * @returns {*} result
 */
exports.login = async function (req, res) {
    const { error, isValid } = loginValidation(req.body)

    if (!isValid) {
        return errorResponse(res, error, 'Invalid Request', 400)
    }

    try {
        const doctor = await Doctor.findOne({ mobile_no: req.body.mobile_no })
        
        if (doctor == null) {
            const otp = await sendOTP(req.body.mobile_no)
            const doctorData = {
                mobile_no: req.body.mobile_no,
                otp: otp
            }
            const newDoctor = new Doctor(doctorData)
            await newDoctor.save()
            return successResponse(res, { otp }, 'OTP sent to your mobile number please varify to login', 200)
        }

        if (doctor.varified === false) {
            return errorResponse(res, {}, `Your profile is under review. you can login once it varified.`, 401)
        }

        if (doctor.status !== 'active') {
            return errorResponse(res, {}, `Your profile is ${doctor.status}.`, 401)
        }

        const otp = await sendOTP(req.body.mobile_no)
        doctor.otp = otp
        await doctor.save()

        return successResponse(res, { otp }, 'OTP sent to your mobile number please varify to login', 200)

    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/doctor/varify-otp (Varify login or registration otp)
 * @access public
 * @returns {*} result
 */
exports.varifyOtp = async function (req, res) {
    const { error, isValid } = otpValidation(req.body)
    if (!isValid) {
        return errorResponse(res, error, 'Invalid Request', 400)
    }

    try {
        const doctor = await Doctor.findOne({ mobile_no: req.body.mobile_no, otp: req.body.otp })
        if (doctor == null) {
            return errorResponse(res, {}, 'Invalid OTP', 200)
        }

        if (doctor.status !== 'active') {
            return errorResponse(res, {}, `Your profile is ${doctor.status}.`, 401)
        }

        if (doctor.profile_status === 'otp_sent') {
            doctor.profile_status = 'otp_varified'
        }

        doctor.otp = ''
        doctor.mobile_verify = true
        doctor.fcm_token = req.body.fcm_token
        doctor.device_type = req.body.device_type
        await doctor.save()

        const token = generateJwtAuthToken(doctor._id, ROLE_DOCTOR)
        return successResponse(res, { token: token, profile_status: doctor.profile_status }, 'OTP successful varified', 200)
    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/doctor/search (Search Doctor profile)
 * @access public
 * @returns {*} result
 */
exports.searchProfile = async function (req, res) {
    try {
        const page = req.query.page
        const city = req.body.city
        const disease = req.body.disease
        const where = {
            // city: city
            profile_status: 'completed'
        }

        const limit = 10
        const offset = (page - 1) * limit
        const select = {
            city: 1,
            first_name: 1,
            last_name: 1,
            gender: 1,
            degree: 1,
            specialization: 1,
            year_of_experience: 1
        }
        const doctors = await Doctor.find(where, select).limit(limit).skip(offset)

        const response = {
            doctors: doctors
        }
        return successResponse(res, response, 'Doctors', 200)
    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/auth/doctor/profile/:id (Search Doctor profile)
 * @access public
 * @returns {*} result
 */
 exports.viewProfile = async function (req, res) {
    try {
        const doctorId = req.params.id
        const select = {
            profile_status: 0,
            status: 0,
            mobile_verify: 0,
            mobile_no: 0,
            otp: 0,
            id_proff: 0,
            medical_registration_proof: 0,
            tc_accepted: 0,
            device_type: 0
        }
        const doctor = await Doctor.findById(doctorId, select)

        const response = { doctor }
        return successResponse(res, response, 'Doctor Profile', 200)
    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}


/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/auth/doctor/profile/:id (Search Doctor profile)
 * @access public
 * @returns {*} result
 */
 exports.dashboard = async function (req, res) {
    try {
        if (req._user.type !== ROLE_DOCTOR) {
            return errorResponse(res, {}, 'Error! You can not have access to this api.', 200)
        }

        const where = {
            doctor_id: getObjectId(req._user.id)
        }
        if(req.body.start_date !== undefined && req.body.end_date !== undefined) {
            where.appintment_datetime = { 
                $gte: moment(req.body.start_date).format('YYYY-MM-DD 00:00:00'),
                $lte: moment(req.body.end_date).format('YYYY-MM-DD 23:59:59')
            }
        } else {
            where.appintment_datetime = { 
                $gte: moment().format('YYYY-MM-DD 00:00:00'),
                $lte: moment().format('YYYY-MM-DD 23:59:59')
            }
        }
        const totalAppointment = await Appointment.countDocuments(where)
        const response = {
            appointment: totalAppointment
        }
        return successResponse(res, response, 'Doctor Profile', 200)
    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}
