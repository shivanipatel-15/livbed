const {
    successResponse,
    errorResponse,
    catchResponse,
    generateJwtAuthToken,
    getObjectId
} = require('../utility')
const { sendOTP } = require('../utility/notification')
const {
    loginValidation,
    registerValidation,
    otpValidation
} = require('./validation/patient.validation')

const { ROLE_PATIENT } = require('../utility/constant')
const Patient = require('../models/patient.model')
const moment = require('moment')
const Appointments = require('../models/appointment.model')

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/patient/register (Register Patient)
 * @access public
 * @returns {*} result
 */
exports.register = async function (req, res) {
    const { error, isValid } = registerValidation(req.body)
    if (!isValid) {
        return errorResponse(res, error, 'Invalid Request', 400)
    }

    try {
        const patient = await Patient.findOne({ mobile_no: req.body.mobile_no, status: { $ne: 'deleted' }, profile_status:  'otp_varified' })
        if (patient == null) {
            return errorResponse(res, {}, 'Patient already exists with same mobile number', 400)
        }

        patient.first_name = req.body.first_name;
        patient.last_name = req.body.last_name;
        patient.gender = req.body.gender;
        patient.mobile_no = req.body.mobile_no;
        patient.aadhar_number = req.body.aadhar_number;
        patient.is_patient = req.body.is_patient;
        patient.tc_accepted = req.body.tc_accepted;
        patient.address = {
            address1: req.body.address1,
            address2: req.body.address2,
            zip: req.body.zip,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country
        }
        patient.profile_status = 'completed';
        const savePatient = await patient.save()

        if (savePatient == null) {
            return errorResponse(res, {}, 'Something went wrong! User not registered', 400)
        }

        const token = generateJwtAuthToken(savePatient._id, ROLE_PATIENT)
        return successResponse(res, { token: token, profile_status: patient.profile_status }, 'Successfully Registered', 200)
    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/patient/login (Login User)
 * @access public
 * @returns {*} result
 */
exports.login = async function (req, res) {
    const { error, isValid } = loginValidation(req.body)

    if (!isValid) {
        return errorResponse(res, error, 'Invalid Request', 400)
    }

    try {
        const patient = await Patient.findOne({ mobile_no: req.body.mobile_no })
        if (patient == null) {
            const otp = await sendOTP(req.body.mobile_no)
            const patientData = {
                mobile_no: req.body.mobile_no,
                otp: otp
            }
            const newPatient = new Patient(patientData)
            await newPatient.save()
            return successResponse(res, { otp }, 'OTP sent to your mobile number please varify to login', 200)
        }

        if (patient.status !== 'active') {
            return errorResponse(res, {}, 'Your profile is ${patient.status}.', 401)
        }

        const otp = await sendOTP(req.body.mobile_no)
        patient.otp = otp
        await patient.save()

        return successResponse(res, { otp }, 'OTP sent to your mobile number please varify to login', 200)

    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/patient/varify-otp (Varify login or registration otp)
 * @access public
 * @returns {*} result
 */
 exports.varifyOtp = async function (req, res) {
    const { error, isValid } = otpValidation(req.body)
    if (!isValid) {
        return errorResponse(res, error, 'Invalid Request', 400)
    }

    try {
        const patient = await Patient.findOne({ mobile_no: req.body.mobile_no, otp: req.body.otp })
        if (patient == null) {
            return errorResponse(res, {}, 'Invalid OTP', 400)
        }

        if (patient.status !== 'active') {
            return errorResponse(res, {}, 'Your profile is ${patient.status}.', 401)
        }

        if (patient.profile_status === 'otp_sent'){
            patient.profile_status = 'otp_varified'
        }

        patient.otp = ''
        patient.mobile_verify = true
        patient.fcm_token = req.body.fcm_token
        patient.device_type = req.body.device_type
        await patient.save()

        const token = generateJwtAuthToken(patient._id, ROLE_PATIENT)
        return successResponse(res, { token: token, profile_status: patient.profile_status }, 'OTP successful varified', 200)
    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/auth/patient/me (Get login user profile)
 * @access public
 * @returns {*} result
 */
exports.loginPatientProfile = async function(req, res){
    try {
        const select = {
            first_name: 1,
            last_name: 1,
            gender: 1,
            mobile_no: 1,
            address: 1,
            status: 1,
            email: 1,
            date_of_birth: 1,
            height: 1,
            weight: 1,
            maritial_status: 1,
            blood_group: 1
        }
        const patient = await Patient.findById(req._user.id, select)
        if (patient == null) {
            return successResponse(res, { }, 'Invalid profile', 401)
        }

        if (patient.status !== 'active') {
            return errorResponse(res, {}, 'Your profile is ${patient.status}.', 401)
        }

        return successResponse(res, { patient }, 'Patient Detail', 200)
    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/auth/patient/editProfile (Edit patient profile)
 * @access public
 * @returns {*} result
 */
 exports.editProfile = async function(req, res){
    try {
        const select = {
            first_name: 1,
            last_name: 1,
            gender: 1,
            mobile_no: 1,
            address: 1,
            status: 1,
            email: 1,
            date_of_birth: 1,
            height: 1,
            weight: 1,
            maritial_status: 1,
            blood_group: 1
        }
        const patient = await Patient.findById(req._user.id, select)
        if (patient == null) {
            return successResponse(res, { }, 'Invalid profile', 401)
        }

        if (patient.status !== 'active') {
            return errorResponse(res, {}, 'Your profile is ${patient.status}.', 401)
        }

        patient.first_name= req.body.first_name
        patient.last_name= req.body.last_name
        patient.gender= req.body.gender
        patient.mobile_no= req.body.mobile_no
        patient.address= {
            address1: req.body.address1,
            address2: req.body.address2,
            city: req.body.city,
            state: req.body.state,
            country: req.body.country,
            zip: req.body.zip
        }
        patient.status= req.body.status
        patient.email= req.body.email
        // patient.date_of_birth = moment(req.body.date_of_birth)
        patient.height= req.body.height
        patient.weight= req.body.weight
        patient.maritial_status= req.body.maritial_status
        patient.blood_group= req.body.blood_group

        const updatePatient = await patient.save()
        return successResponse(res, { updatePatient }, 'Patient Profile updated', 200)
    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/auth/patient/dashboard (Get login user profile)
 * @access public
 * @returns {*} result
 */
 exports.dashboard = async function(req, res){
    try {
        const project = {
            payment: 1,
            status: 1,
            patient_id: 1,
            doctor_id: 1,
            appintment_datetime: 1,
            createdAt: 1,
            updatedAt: 1, 
            doctor_info: {
                first_name: 1,
                last_name: 1,
                city: 1,
                gender: 1,
                specialization: 1,
                degree: 1
            }
        }
        const lookup = {
            from: 'doctors',
            localField: 'doctor_id',
            foreignField: '_id',
            as: 'doctor_info'
        }
        const unwind = '$doctor_info'
        const lastAppointment = await Appointments.aggregate([
            { $lookup: lookup },
            { $unwind: unwind },
            { $project: project },
            { $limit: 1 },
            { $sort: { createdAt: -1 } }
        ])

        const response = {
            appointment: lastAppointment[0],
        }
        return successResponse(res, response, 'Dasbhoard data', 200)
    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}