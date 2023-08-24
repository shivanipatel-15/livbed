const API_SUCCESS = 1
const API_ERROR = 0
// time out in ms (second*1000)
const TIME_OUT = 300000

/**
 *  get success response with its flag 0 or 1
 *
 * @param {object} res Http Response
 * @param {object} data response data
 * @param {string} message success response message
 * @param {number} status response status
 */
const successResponse = (res, data, message = '', status) => {
    res.send({
        success: API_SUCCESS,
        status: status,
        message: message,
        data: data
    })
}

/**
 *  get error response with its flag 0 or 1
 *
 * @param {object} res Http Response
 * @param {object} error error
 * @param {string} message error response message
 * @param {number} status response status
 */
const errorResponse = (res, error, message = '', status) => {
    res.send({
        success: API_ERROR,
        status: status,
        message: message,
        error: error
    })
}

/**
 *  catch error response with its flag 0 or 1
 *
 * @param {object} res Http Response
 * @param {object} error error
 * @param {string} message error response message
 * @param {number} status response status
 */
const catchResponse = (res, error, responseError, message, status) => {
    console.log(error)
    res.status(500).send(errorResponse(res, responseError, message, status))
}

/**
 *  validation error response with its flag 0 or 1
 *
 * @param {object} res Http Response
 * @param {object} error error
 * @param {string} message error response message
 * @param {number} status response status
 */
const validationErrorResponse = (res, error, message, status) => {
    res.status(400).send(errorResponse(res, error, message, status))
}

/**
 *  unauthorize access error response with its flag 0 or 1
 *
 * @param {object} res Http Response
 * @param {object} error error
 * @param {string} message error response message
 * @param {number} status response status
 */
const unauthorizedErrorResponse = (res, error, message, status) => {
    res.status(401).send(errorResponse(res, error, message, status))
}


/**
 *  check value is empty or not
 *
 * @param {any} value value
 * @return {boolean} status true/false
 */
const isEmpty = value =>
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)


/**
 *  get File Extention from filename
 *
 * @param {string} fileName filename
 * @return {string} extention file extention
 */

const getFileExtension = (fileName) => {
    let items = fileName.split(/\.(?=[^.]+$)/)
    if (items.length === 2) {
        return items[1]
    }
    return ''
}

/**
 * @param {number} ms timeout in millisecond
 * @param {Promise} promise Function which returns promise
 * @description Timeout a promise function
 * @returns {*} result
 */
const promiseTimeout = function (ms, promise) {
    // Create a promise that rejects in <ms> milliseconds
    let timeout = new Promise((resolve, reject) => {
        let id = setTimeout(() => {
            clearTimeout(id)
            reject('Timed out in ' + ms + 'ms.')
        }, ms)
    })

    // Returns a race between our timeout and the passed in promise
    return Promise.race([
        promise,
        timeout
    ])
}

/**
 * @param {*} defaults default object
 * @param {*} current current object
 * @description Override object value
 * @returns {*} result
 */
const mergeObject = function (defaults, current) {
    Object.keys(defaults).forEach(function (key_default) {
        if (typeof current[key_default] == 'undefined') {
            current[key_default] = defaults[key_default]
        } else if (isObject(defaults[key_default]) && isObject(current[key_default])) {
            mergeObject(defaults[key_default], current[key_default])
        }
    })

    /**
     * @param {*} object object
     * @description Check value is object or not
     * @returns {*} result
     */
    function isObject(object) {
        return Object.prototype.toString.call(object) === '[object Object]'
    }

    return current
}

/**
 * @param {string} id string id
 * @description Convert string object id to mongoose object id
 * @returns {*} result
 */
const getObjectId = function (id) {
    const mongoose = require('mongoose')
    return mongoose.Types.ObjectId(id)
}

/**
 * @description Return current utc time value
 * @returns {*} result
 */
const currentUTCTime = function () {
    const moment = require('moment')
    return moment.utc().valueOf()
}

/**
 * @description generate JWT auth token
 * @param {string} id user id
 * @returns {string} type user type
 */
function generateJwtAuthToken(id, type) {
    const jwt = require('jsonwebtoken')

    const privateKey = process.env.JWT_SECRET
    const tokenPayload = { id, type }
    const token = jwt.sign(tokenPayload, privateKey, { expiresIn: '365d' })
    return token
}

function varifyJwtToken(token) {
    const jwt = require('jsonwebtoken')
    const privateKey = process.env.JWT_SECRET
    return new Promise((resolve, reject) => {
        jwt.verify(token, privateKey, async function (error, data) {
            if (error) {
                reject()
            }
            resolve(data)
        })
    })
}

module.exports = {
    successResponse,
    errorResponse,
    catchResponse,
    validationErrorResponse,
    unauthorizedErrorResponse,
    isEmpty,
    getFileExtension,
    promiseTimeout,
    TIME_OUT,
    mergeObject,
    getObjectId,
    currentUTCTime,
    generateJwtAuthToken,
    varifyJwtToken
}
