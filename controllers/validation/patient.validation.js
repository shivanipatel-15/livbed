const { isEmpty } = require('../../utility/index')

/**
 * @description User register params validation
 * @param {object} params request params
 * @returns {error: Object, isValid: boolean } result
 */
function registerValidation(params) {
    let error = {}

    if (isEmpty(params.first_name)) {
        error.first_name = 'Name should not be empty'
    }

    if (isEmpty(params.last_name)) {
        error.last_name = 'Name should not be empty'
    }

    if (isEmpty(params.mobile_no)) {
        error.mobile_no = 'Mobile No should not be empty'
    }

    if (isEmpty(params.tc_accepted)) {
        error.tc_accepted = 'Terms and condition must be accepted'
    }

    return {
        error,
        isValid: isEmpty(error)
    }
}

/**
 * @description Login params validation
 * @param {object} params request params
 * @returns {error: Object, isValid: boolean } result
 */
function loginValidation(params) {
    let error = {}

    if (isEmpty(params.mobile_no)) {
        error.mobile_no = 'Mobile No should not be empty'
    }

    return {
        error,
        isValid: isEmpty(error)
    }
}

/**
 * @description OTP varificaiton params
 * @param {object} params request params
 * @returns {error: Object, isValid: boolean } result
 */
 function otpValidation(params) {
    let error = {}

    if (isEmpty(params.mobile_no)) {
        error.mobile_no = 'Mobile No should not be empty'
    }

    if (isEmpty(params.otp)) {
        error.otp = 'OTP should not be empty'
    }

    return {
        error,
        isValid: isEmpty(error)
    }
}

module.exports = { registerValidation, loginValidation, otpValidation }
