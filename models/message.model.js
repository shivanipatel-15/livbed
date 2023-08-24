const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MessageSchema = new Schema({
    group_id: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    sender_id: {
        type: String,
        required: true,
        trim: true
    },
    receiver_id: {
        type: String,
        required: true,
        trim: true
    },
    message_type: {
        type: String,
        required: true,
        enum: ['text', 'image'],
        default: 'text'
    },
    message: {
        type: String,
        trim: true
    },
    message_url: {
        type: String,
        trim: true
    },
    loading: {
        type: Boolean,
        trim: true
    },
    read_status: {
        type: Boolean,
        default: false
    },
    is_removed: {
        type: Boolean,
        default: false
    }
}, { timestamp: true })

module.exports = mongoose.model('messages', MessageSchema)
