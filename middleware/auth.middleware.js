const { unauthorizedErrorResponse } = require('../utility/index')
const { errorResponse, varifyJwtToken } = require('../utility')

/**
 * @param {Array} allowedRoles possible values are 'ROLE_ADMIN' | 'ROLE_DOCTOR' | 'ROLE_PATIENT'
 * @description verify route role
 * @returns {*} result
 */
const protectRouteWithRole = (allowedRoles) => {
    return async (req, res, next) => {
        let token = req.headers.token
        if (token == null) {
            return unauthorizedErrorResponse(res, {}, 'Unauthorized', 401)
        }

        try {
            const user_data = await varifyJwtToken(token)
            const role = user_data.type
            if (allowedRoles.indexOf(role) == -1) {
                return errorResponse(res, {}, 'Error! You can not have access to this api.', 200)
            }
            req._user = user_data
            next()
        }catch (error){
            return unauthorizedErrorResponse(res, {}, 'Unauthorized Access', 401)
        }
    }
}


module.exports = { protectRouteWithRole }
