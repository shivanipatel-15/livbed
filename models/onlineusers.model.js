const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OnlineUsersSchema = new Schema({
    user_id: {
        type: String,
        trim: true,
        index: true
    },
    user_type: {
        type: String,
        index: true
    },
    socket_id: {
        type: String,
        index: true
    }
}, { timestamp: true })

module.exports = mongoose.model('online_users', OnlineUsersSchema)
