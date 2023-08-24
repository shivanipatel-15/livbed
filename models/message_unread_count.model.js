const mongoose = require('mongoose')
const Schema = mongoose.Schema

// create Schema
const MessageUnreadCountSchema = new Schema({
    doctor_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        trim: true
    },
    patient_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        trim: true
    },
    doctor_unread_count: {
        type: Number,
        trim: true,
        default: 0
    },
    patient_unread_count: {
        type: Number,
        trim: true,
        default: 0
    }
})

module.exports = mongoose.model('message_unread_counts', MessageUnreadCountSchema)
