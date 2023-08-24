const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DoctorSchema = new Schema({
    first_name: {
        type: String,
        trim: true
    },
    last_name: {
        type: String,
        trim: true
    },
    mobile_no: {
        type: Number,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    profile_status: {
        type: String,
        enum: ['otp_sent', 'otp_varified', 'completed'],
        default: 'otp_sent'
    },
    otp: {
        type: Number,
        trim: true
    },
    specialization: {
        type: String,
        index: true
    },
    gender: {
        type: String,
        enum: ['male', 'female']
    },
    city: {
        type: String,
        index: true
    },
    degree: {
        type: String
    },
    collage: {
        type: String
    },
    year_of_completion: {
        type: Number
    },
    year_of_experience: {
        type: Number
    },
    registration_number: {
        type: String,
        trim: true
    },
    registration_council: {
        type: String,
        trim: true
    },
    registration_year: {
        type: Number,
        trim: true
    },
    id_proff: {
        type: String
    },
    medical_registration_proof: {
        type: String
    },
    is_practicing: {
        type: Boolean
    },
    hospital_name: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        trim: true,
        enum: ['active', 'blocked', 'deleted'],
        default: 'active'
    },
    varified: {
        type: Boolean,
        default: false
    }, 
    mobile_verify: {
        type: Boolean,
        default: false
    },
    tc_accepted: {
        type: Boolean
    },
    fcm_token: {
        type: String,
        trim: true
    },
    device_type: {
        type: String,
        enum: ['android', 'ios', 'web'],
        default: 'web'
    }
}, { timestamps: true })

module.exports = mongoose.model('doctors', DoctorSchema)
