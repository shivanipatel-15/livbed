const { isEmpty } = require('../../utility/index')

/**
 * @description User register params validation
 * @param {object} params request params
 * @returns {error: Object, isValid: boolean } result
 */
function registerValidation(params) {
    let error = {}

    if (isEmpty(params.hospital_name)) {
        error.hospital_name = 'Name should not be empty'
    }

    if (isEmpty(params.mobile_no)) {
        error.mobile_no = 'Mobile No should not be empty'
    }

    if (isEmpty(params.hospital_type)) {
        error.hospital_type = 'Hospital type should not be empty'
    }

    if (isEmpty(params.password)) {
        error.password = 'Password should not be empty'
    }

    if (isEmpty(params.tc_accepted)) {
        error.tc_accepted = 'Terms and condition must be accepted'
    }

    return {
        error,
        isValid: isEmpty(error)
    }
}

module.exports = { registerValidation }