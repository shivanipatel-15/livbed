const moment = require('moment')
const { varifyJwtToken, getObjectId } = require('./../utility')
const current_date = moment().format('YYYY-MM-DD HH:mm:ss')
const OnlineUsers = require('../models/onlineusers.model')
const Doctor = require('../models/doctor.model')
const Patient = require('../models/patient.model')
const { ROLE_PATIENT, ROLE_DOCTOR } = require('../utility/constant')
const { sendPushNotification } = require('../utility/notification')

const socket_io = function (io) {
    io.use((socket, next) => {
        const token = socket.handshake.query.token
        if (!token) {
            return next(new Error('Unauthorized'))
        }
        try {
            const user_data = await varifyJwtToken(token)
            setActiveUser(socket, io, user_data.user_id, user_data.type)
            next()
        } catch (error) {
            return next(new Error('Unauthorized'))
        }

    })

    io.on('connection', function (socket) {
        console.log('socket connected')
        offline(socket, io)
        disconnect(socket, io)
        newMessage(socket, io)
        readMessage(socket, io)
        getActiveUsers(socket)
        getAllMessagesByGroupId(socket)
    })
}

/**
 * @description if user connect to socket then add to DB
 * @param {object} socket socket reference
 * @param {object} io IO reference
 * @param {*} user_id user id
 * @param {*} user_type  user type
 */
async function setActiveUser(socket, io, user_id, user_type) {
    const filter = { user_id: user_id, user_type: user_type }
    const update = { socket_id: socket.id }
    const option = { upsert: true }
    await OnlineUsers.findOneAndUpdate(filter, update, option)
    await emitOnlineUser(io, offlineUser.user_type)
}

/**
 * @description update user status to disconnect default
 * @param {object} socket socket reference
 * @param {object} io IO reference
 */
function disconnect(socket, io) {
    socket.on('disconnect', async function () {
        socketDisconnect(socket, io)
    })
}

/**
 * @description update user status to disconnect on logout
 * @param {object} socket socket reference
 * @param {object} io IO reference
 */
function offline(socket, io) {
    socket.on('offline', async function () {
        socketDisconnect(socket, io)
    })
}

/**
 * @description Socket Disconnect
 * @param {object} socket socket reference
 * @param {object} io IO reference
 */
async function socketDisconnect(socket, io) {
    const offlineUser = await OnlineUsers.findOne({ socket_id: socket.id })
    await emitOnlineUser(io, offlineUser.user_type)
    await offlineUser.delete()
}

/**
 * @description Emit socket event and send all online users
 * @param {object} io IO reference
 * @param {string} user_type user type
 */
async function emitOnlineUser(io, user_type) {
    if (user_type == ROLE_PATIENT) {
        const onlinePatients = await OnlineUsers.find({ user_type: ROLE_PATIENT })
        io.emit(`online_${ROLE_DOCTOR}`, onlinePatients)
    } else {
        const onlineDoctors = await OnlineUsers.find({ user_type: ROLE_DOCTOR })
        io.emit(`online_${ROLE_PATIENT}`, onlineDoctors)
    }
}

/**
 * @description callback active users
 * @param {*} socket socket reference
 */
 function getActiveUsers(socket) {
    socket.on(`online_${ROLE_DOCTOR}`, async function (callback) {
        const onlineDoctors = await OnlineUsers.find({ user_type: ROLE_DOCTOR })
        callback(onlineDoctors)
    })

    socket.on(`online_${ROLE_PATIENT}`, async function (callback) {
        const onlinePatients = await OnlineUsers.find({ user_type: ROLE_PATIENT })
        callback(onlinePatients)
    })
}


/**
 * @description New Message
 * @param {object} socket socket reference
 * @param {object} io IO reference
 */
function newMessage(socket, io) {
    socket.on('new_message', async function (data) {
        const message = new Message(data)
        const saveMessage = await message.save()
        data._id = saveMessage._id
        // update message unread count
        const [doctor_id, patient_id] = data.group_id.split('_')
        const updateCount = {
            doctor_id: doctor_id,
            patient_id: patient_id,
            user_type: data.user_type
        }
        await updateUnreadCount(updateCount)

        io.emit(`message_${data.group_id}`, data)
        io.emit('get_new_message_of_user_list', data)

        const notificationData = {
            title: "You have new message", 
            message: data.message_type === 'text' ? data.message : 'Image',  
            action: 'new_message',
            action_id: data.group_id
        }
        const token = []
        let deviceType = ''
        if (doctor_id === data.sender_id) {
            //  send notification to patient
            const patient = await Patient.findById(data.receiver_id, { fcm_token:1, device_type: 1 })
            token.push(patient.fcm_token)
            deviceType = patient.device_type
        } else {
            // send notification to doctor
            const doctor = await Doctor.findById(data.receiver_id, { fcm_token:1, device_type: 1 })
            token.push(doctor.fcm_token)
            deviceType = doctor.device_type
        }

        sendPushNotification(token, notificationData, deviceType)
    })
}

/**
 * @description Update sender and receiver unread message count
 * @param {object} data object contain patient_id and doctor_id
 * @param {boolean} update counter update or not
 */
async function updateUnreadCount(data, update = true) {
    if (data.patient_id != null && data.doctor_id != null) {
        const countWhere = {
            doctor_id: getObjectId(data.doctor_id),
            patient_id: getObjectId(data.patient_id)
        }
        const otherUserType = data.user_type == ROLE_PATIENT ? ROLE_DOCTOR : ROLE_PATIENT

        let updateCount = {}
        if (update == true) {
            updateCount = { [`${otherUserType}_unread_count`]: +1 }
        }

        const resetCount = { [`${data.user_type}_unread_count`]: 0 }

        await MessageCount.findOneAndUpdate(
            countWhere,
            { $set: resetCount, $inc: updateCount },
            { upsert: true }
        )
    }
}

/**
 * @description get all message by pagination
 * @param {*} socket socket object
 */
 function getAllMessagesByGroupId(socket) {
    socket.on(`all_messages`, async function (data, callback) {
        const messages = await getMessages(data)
        await updateAllMessageReadStatus(data)
        callback(messages)
    })
}

/**
 * @description get all messages from database on group and page no
 * @param {object} data object of page, group_id 
 * @returns {array} all messages
 */
 async function getMessages(data) {
    try {
        const page = data.page
        const limit = 50
        const offset = (page - 1) * limit
        const where = { group_id: data.group_id }
        const getMessage = await Message.find(where).limit(limit).skip(offset)

        return getMessage
    } catch (error) {
        console.log(error)
    }
}

/**
 * @description update all message status unread to read
 * @param {object} data object of group_id and user_id who read message
 */
 async function updateAllMessageReadStatus(data) {
    try {
        const where = { group_id: data.group_id, receiver_id: data.user_id, read_status: false }
        const update = { read_status: true }
        await Message.updateMany(where, update)
        
        // update unread message count
        const [doctor_id, patient_id] = data.group_id.split('_')
        const updateCount = {
            doctor_id: doctor_id,
            patient_id: patient_id,
            user_type: data.user_id == doctor_id ? ROLE_DOCTOR : ROLE_PATIENT
        }
        await updateUnreadCount(updateCount, false)
    } catch (error) {
        console.log(error)
    }
}

/**
 * @description read message
 * @param {object} socket 
 */
function readMessage(socket){
    socket.on(`read_message`, async function (data) {
        await updateAllMessageReadStatusByMessage(data)
    })
}

module.exports = { socket_io }
