const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AppointmentsSchema = new Schema({
    patient_id: {
        type: Schema.Types.ObjectId,
        ref: 'patients'
    },
    doctor_id: {
        type: Schema.Types.ObjectId,
        ref: 'doctors'
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'hold', 'completed', 'cancelled'],
        default: 'pending',
        index: true
    },
    payment: {
        status: {
            type: String,
            enum: ['init', 'processing', 'success', 'fail'],
            default: 'init',
            index: true
        },
        method: {
            type: String,
            enum: ['credit_debit_card', 'net_banking', 'upi']
        },
        amount: {
            type: Number
        }
    },
    appintment_datetime: {
        type: Date,
        index: true
    },
    appointment_progress_history: {
        type: Object
    },
    prescription: {
        type: Object
    },
    symptoms: {
        type: Array
    },
    is_emergency: {
        type: Boolean,
        default: false
    },
    language: {
        type: String
    }
}, { timestamps: true })

module.exports = mongoose.model('appointments', AppointmentsSchema)
