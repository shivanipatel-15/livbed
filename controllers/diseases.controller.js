const {
    successResponse,
    catchResponse
} = require('../utility')

/**
 * @param {*} req request
 * @param {*} res request
 * @description POST api/v1/diseases/list
 * @access public
 * @returns {*} result
 */
 exports.list = async function (req, res) {
    try {
        const search = req.body.search
        const diseases = [
            { id: 1, name: 'Acne, Pimple' },
            { id: 2, name: 'Cough' },
            { id: 3, name: 'Fever' },
            { id: 4, name: 'Period doubts' },
            { id: 5, name: 'Hairfall' }
        ]
        const result = diseases.filter(disease => {
            const lowerCase = disease.name.toLowerCase()
            return lowerCase.includes(search)
        });

        const response = {
            diseases: result
        }
        return successResponse(res, response, 'diseases', 200)

    } catch (err) {
        return catchResponse(res, err, {}, 'Something went wrong', 500)
    }
}