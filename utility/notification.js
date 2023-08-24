const { FCM_SERVER_KEY, SMS_SENDER_ID, SMS_AUTH_TOKEN, ENTITY_ID, SMS_TEMPLATE_ID } = require('./constant')

/**
 * @description send OTP to mobile number
 * @param {number} mobile_no
 * @returns {number} OTP
 */
 async function sendOTP(mobile_no){
    const axios = require('axios')
    const otp = Math.floor(100000 + Math.random() * 900000)
    const params = { 
        auth: SMS_AUTH_TOKEN,
        senderid: SMS_SENDER_ID,
        msisdn: mobile_no,
        message: `Dear User, Your OTP for LivBed is: ${otp} Regards www.intranotion.com`,
        entity_id: ENTITY_ID,
        template_id: SMS_TEMPLATE_ID
    }
    const config = {
        strictSSL: false,
        rejectUnauthorized: false,
        headers: { 'cache-control': 'no-cache' },
        params: params
    }
    
    // https://global.datagenit.com/API/sms-api.php
    const response = await axios.get('https://api.datagenit.com/sms', config);
    console.log(response.data)
    if(response.data.status === 'success'){
        return otp
    }
    return false
}

/**
 * @description Send FCM notification
 * @param {Array} tokens array token
 * @param {Object} notificationData {title: string, message: string, action: string, action_id: string, extra: object}
 * @param {string} deviceType Possible value : android, ios, web
 */
async function sendPushNotification(tokens, notificationData, deviceType) {
    const FCM = require('fcm-node');
    const fcm = new FCM(FCM_SERVER_KEY);
    
    const message = { 
        registration_ids: tokens,
        data: notificationData 
    }
    
    if(deviceType === 'ios'){
        message.notification = notificationData
    }

    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!", err)
        } else {
            console.log("Successfully sent with response: ", response)
        }
    })
}

module.exports = { sendOTP, sendPushNotification }
