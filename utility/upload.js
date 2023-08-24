/**
 * @param {*} file media data
 * @param {string} mimetype mimetype
 * @param {string} file_name file_name
 * @param {string} uploadPath dimension
 * @description Upload media to aws S3
 * @returns {*} result
 */
 const uploadMediaToS3 = async function (file, mimetype, file_name, uploadPath) {
    const AWS = require('aws-sdk')
    const { v4: uuidv4 } = require('uuid')

    // get S3 setting from db
    const [err, fileExtension] = file_name.split(/\.(?=[^\.]+$)/)
    const fileName = `${uploadPath}${uuidv4()}.${fileExtension}`

    if (process.env.s3_access_key == '' || process.env.s3_secret_key == '' || process.env.s3_region == '') {
        return { success: false, response: {}, message: 'Invalid S3 Setting' }
    }

    AWS.config.update({
        accessKeyId: process.env.s3_access_key,
        secretAccessKey: process.env.s3_secret_key,
        region: process.env.s3_region
    })

    const s3 = new AWS.S3()

    const uploadParams = {
        Bucket: process.env.s3_bucket,
        Body: file,
        Key: fileName,
        ACL: 'public-read',
        ContentType: mimetype
    }

    try {
        const response = await s3.upload(uploadParams).promise()
        return { success: true, response }
    } catch (err) {
        console.log('aws Error', err)
        return { success: false, response: err, message: 'S3 Error' }
    }
}

module.exports = { uploadMediaToS3 }