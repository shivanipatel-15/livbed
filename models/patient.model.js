const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PatientSchema = new Schema({
    first_name: {
        type: String,
        trim: true
    },
    last_name: {
        type: String,
        trim: true
    },
    gender: {
        type: String,
        enum: ['male', 'female']
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
    is_patient: {
        type: Boolean,
        default: true,
        trim: true
    },
    address: {
        address1: {
            type: String,
            trim: true
        },
        address2: {
            type: String,
            trim: true
        },
        zip: {
            type: Number,
            trim: true
        },
        city: {
            type: String,
            trim: true
        },
        state: {
            type: String,
            trim: true
        },
        country: {
            type: String,
            trim: true
        },
    },
    aadhar_number: {
        type: Number,
        trim: true,
        index: true
    },
    tc_accepted: {
        type: Boolean
    },
    status: {
        type: String,
        trim: true,
        enum: ['active', 'blocked', 'deleted'],
        default: 'active'
    },
    mobile_verify: {
        type: Boolean,
        default: false
    },
    email: {
        type: String
    },
    date_of_birth: {
        type: Date
    },
    height: {
        type: String
    },
    weight: {
        type: String
    },
    maritial_status: {
        type: String
    },
    blood_group: {
        type: String
    }
}, { timestamps: true })

module.exports = mongoose.model('patients', PatientSchema)
