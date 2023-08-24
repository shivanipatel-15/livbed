const moment = require('moment-timezone')
const {
    successResponse,
    errorResponse,
    catchResponse,
    getObjectId
} = require('../utility')
const { ROLE_PATIENT, ROLE_DOCTOR } = require('../utility/constant')
const Appointments = require('../models/appointment.model')
const Doctor = require('../models/doctor.model')

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/auth/consultation/book_appointment
 * @access protected
 * @returns {*} result
 */
exports.bookAppointment = async function (req, res) {
    try {
        if (req._user.type !== ROLE_PATIENT) {
            return errorResponse(res, {}, 'Error! You can not have access to this api.', 200)
        }

        const appointmentData = {
            patient_id: getObjectId(req._user.id),
            appintment_datetime: req.body.appointment_date,
            payment: {
                status: req.body.payment_status,
                method: req.body.payment_method,
                amount: req.body.amount,
            }
        }

        if (req.body.is_emergency !== undefined) {
            appointmentData.is_emergency = req.body.is_emergency
            // TODO: find online doctor
            const doctor = await Doctor.findOne({ profile_status: 'completed', status: 'active' }, { _id: 1 }).sort({ createdAt: -1 })
            if(doctor === null){
                return errorResponse(res, {}, 'Sorry! no doctor found at a time please try again later', 200)
            }
            appointmentData.doctor_id = getObjectId(doctor._id)
            appointmentData.language = req.body.language
        } else {
            appointmentData.doctor_id = getObjectId(req.body.doctor_id)
        }
        
        const appointment = new Appointments(appointmentData)
        const saveAppointment  = await appointment.save()
        const appointmentId = saveAppointment._id
        return successResponse(res, { id: appointmentId }, 'Your Appointment successfully booked', 200)

    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/auth/consultation/appointments
 * @access protected
 * @returns {*} result
 */
 exports.myAppointment = async function (req, res) {
    try {
        const where = {
            status: { $in: ['pending', 'processing']},
            // 'payment.status': 'success'
        }
        let project = {
            payment: 1,
            status: 1,
            patient_id: 1,
            doctor_id: 1,
            appintment_datetime: 1,
            createdAt: 1,
            updatedAt: 1
        }
        let lookup = {}
        let unwind = ''
        if (req._user.type === ROLE_PATIENT) {
            where.patient_id = getObjectId(req._user.id) 
            lookup = {
                from: 'doctors',
                localField: 'doctor_id',
                foreignField: '_id',
                as: 'doctor_info'
            }
            unwind = '$doctor_info'
            project['doctor_info.first_name'] = 1
            project['doctor_info.last_name'] = 1
            project['doctor_info.city'] = 1
            project['doctor_info.gender'] = 1
            project['doctor_info.specialization'] = 1
            project['doctor_info.degree'] = 1
        }

        if (req._user.type === ROLE_DOCTOR) {
            where.doctor_id = getObjectId(req._user.id) 
            lookup = {
                from: 'patients',
                localField: 'patient_id',
                foreignField: '_id',
                as: 'patient_info'
            }
            unwind = '$patient_info'
            project['patient_info.first_name'] = 1
            project['patient_info.last_name'] = 1
            project['patient_info.gender'] = 1
        }
                
        const appointments = await Appointments.aggregate([
            { $match: where },
            { $lookup: lookup },
            { $unwind: unwind },
            { $project: project },
            { $sort: { createdAt: -1 } }
         ])
        return successResponse(res, appointments, 'Recent Appointments', 200)

    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/auth/consultation/add_symptoms
 * @access protected
 * @returns {*} result
 */
 exports.addSymtoms = async function (req, res) {
    try {
        if (req._user.type !== ROLE_PATIENT) {
            return errorResponse(res, {}, 'Error! You can not have access to this api.', 200)
        }
        
        const appointmentId = req.body.appointment_id
        const symptoms = req.body.symptoms
        const otehrSymtoms = req.body.other_symtoms

        const allSymtoms = [...symptoms, otehrSymtoms]

        const findAppointment = await Appointments.findById(getObjectId(appointmentId))
        if(findAppointment == null) {
            return errorResponse(res, {}, 'Error! Invalid appointment.', 200)
        }
        
        findAppointment.symptoms = allSymtoms
        await findAppointment.save()

        return successResponse(res, { id: appointmentId }, 'Your Appointment successfully updated', 200)

    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/auth/consultation/appointment/:id
 * @access protected
 * @returns {*} result
 */
 exports.appointmentDetail = async function (req, res) {
    try {
        const appointment_id = req.param.id

        const where = {
            _id: getObjectId(appointment_id)
        }
        let project = {
            payment: 1,
            status: 1,
            patient_id: 1,
            doctor_id: 1,
            appintment_datetime: 1,
            createdAt: 1,
            updatedAt: 1
        }
        let lookup = {}
        let unwind = ''
        if (req._user.type === ROLE_PATIENT) {
            where.patient_id = getObjectId(req._user.id) 
            lookup = {
                from: 'doctors',
                localField: 'doctor_id',
                foreignField: '_id',
                as: 'doctor_info'
            }
            unwind = '$doctor_info'
            project['doctor_info.first_name'] = 1
            project['doctor_info.last_name'] = 1
            project['doctor_info.city'] = 1
            project['doctor_info.gender'] = 1
            project['doctor_info.specialization'] = 1
            project['doctor_info.degree'] = 1
        }

        if (req._user.type === ROLE_DOCTOR) {
            where.doctor_id = getObjectId(req._user.id) 
            lookup = {
                from: 'patients',
                localField: 'patient_id',
                foreignField: '_id',
                as: 'patient_info'
            }
            unwind = '$patient_info'
            project['patient_info.first_name'] = 1
            project['patient_info.last_name'] = 1
            project['patient_info.gender'] = 1
        }
                
        const appointments = await Appointments.aggregate([
            { $match: where },
            { $lookup: lookup },
            { $unwind: unwind },
            { $project: project },
            { $sort: { createdAt: -1 } }
         ])
        return successResponse(res, appointments, 'Appointment Detail', 200)

    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}